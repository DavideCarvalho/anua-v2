import { Redis } from 'ioredis'
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream'
import env from '#start/env'

let context: ResumableStreamContext | null = null
let redisHealthy = true
let lastFailureAt = 0
const FAILURE_BACKOFF_MS = 30_000

// resumable-stream's internal cleanup timer calls subscriber.unsubscribe() on a
// dead Redis connection, which throws synchronously inside a setTimeout — there
// is no userspace try/catch that can reach it. Install a one-shot process
// guard that swallows ioredis-shaped errors so the dev server doesn't die when
// the Redis proxy is flaky.
let uncaughtHandlerInstalled = false
function installUncaughtRedisGuard(): void {
  if (uncaughtHandlerInstalled) return
  uncaughtHandlerInstalled = true
  process.on('uncaughtException', (err: Error) => {
    const msg = err?.message ?? ''
    const isRedis =
      err?.name === 'MaxRetriesPerRequestError' ||
      msg.includes("Stream isn't writeable") ||
      msg.includes('enableOfflineQueue') ||
      msg.includes('Connection is closed') ||
      err?.stack?.includes('ioredis')
    if (isRedis) {
      // eslint-disable-next-line no-console
      console.warn(`[ai-redis] swallowed uncaught: ${msg}`)
      redisHealthy = false
      lastFailureAt = Date.now()
      return
    }
    // Not ours — restore default crash behavior
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  })
}

function markUnhealthy(err: Error, label: string): void {
  if (redisHealthy) {
    // eslint-disable-next-line no-console
    console.warn(`[ai-redis:${label}] ${err.message} — disabling Redis-backed features`)
  }
  redisHealthy = false
  lastFailureAt = Date.now()
}

function isRedisAvailable(): boolean {
  if (redisHealthy) return true
  if (Date.now() - lastFailureAt > FAILURE_BACKOFF_MS) {
    redisHealthy = true
    return true
  }
  return false
}

function makeRedisClient(label: string): Redis {
  installUncaughtRedisGuard()
  const secret = env.get('REDIS_PASSWORD')
  const password = secret ? secret.release() : undefined
  const client = new Redis({
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: password || undefined,
    keyPrefix: 'anua:',
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  })
  client.on('error', (err) => markUnhealthy(err, label))
  return client
}

export function getResumableStreamContext(): ResumableStreamContext | null {
  if (!isRedisAvailable()) return null
  if (context) return context
  try {
    context = createResumableStreamContext({
      keyPrefix: 'ai-stream',
      waitUntil: null,
      publisher: makeRedisClient('publisher'),
      subscriber: makeRedisClient('subscriber'),
    })
    return context
  } catch (err) {
    markUnhealthy(err instanceof Error ? err : new Error(String(err)), 'context')
    return null
  }
}

const ACTIVE_STREAM_TTL_SECONDS = 60 * 60

let activeStreamRedis: Redis | null = null

function getActiveStreamRedis(): Redis {
  if (!activeStreamRedis) {
    activeStreamRedis = makeRedisClient('active-stream')
  }
  return activeStreamRedis
}

function activeStreamKey(threadId: string): string {
  return `ai-stream:active:${threadId}`
}

export async function rememberActiveStream(threadId: string, streamId: string): Promise<void> {
  if (!isRedisAvailable()) return
  try {
    await getActiveStreamRedis().setex(
      activeStreamKey(threadId),
      ACTIVE_STREAM_TTL_SECONDS,
      streamId
    )
  } catch {
    // already marked unhealthy by error handler
  }
}

export async function getActiveStream(threadId: string): Promise<string | null> {
  if (!isRedisAvailable()) return null
  try {
    return await getActiveStreamRedis().get(activeStreamKey(threadId))
  } catch {
    return null
  }
}

export async function clearActiveStream(threadId: string): Promise<void> {
  if (!isRedisAvailable()) return
  try {
    await getActiveStreamRedis().del(activeStreamKey(threadId))
  } catch {
    // ignore
  }
}
