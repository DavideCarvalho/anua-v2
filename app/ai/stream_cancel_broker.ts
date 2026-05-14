import { Redis } from 'ioredis'
import env from '#start/env'

/**
 * Cross-pod cancel broker for in-flight AI chat streams.
 *
 * A naive `Map<threadId, AbortController>` only works on a single replica.
 * If we scale to multiple servers, the POST /cancel can land on a different
 * pod than the one streaming tokens. To bridge that gap we fan out cancels
 * over Redis pub/sub: every pod psubscribes to `ai-chat:cancel:*`, and the
 * pod that owns the local AbortController for `threadId` aborts it; the rest
 * silently ignore.
 *
 * When Redis is down we degrade to local-only cancels (same-pod still works).
 */
const CHANNEL_PREFIX = 'anua:ai-chat:cancel:'

const localControllers = new Map<string, AbortController>()
let publisher: Redis | null = null
let subscriber: Redis | null = null
let subscribed = false
let initFailed = false

function makeClient(label: string): Redis {
  const secret = env.get('REDIS_PASSWORD')
  const password = secret ? secret.release() : undefined
  const client = new Redis({
    host: env.get('REDIS_HOST'),
    port: env.get('REDIS_PORT'),
    password: password || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  })
  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.warn(`[ai-cancel:${label}] ${err.message}`)
    initFailed = true
  })
  return client
}

async function ensureSubscribed(): Promise<void> {
  if (subscribed || initFailed) return
  try {
    if (!subscriber) subscriber = makeClient('subscriber')
    if (!publisher) publisher = makeClient('publisher')
    await subscriber.psubscribe(`${CHANNEL_PREFIX}*`)
    subscriber.on('pmessage', (_pattern, channel) => {
      const threadId = channel.slice(CHANNEL_PREFIX.length)
      if (!threadId) return
      const controller = localControllers.get(threadId)
      if (!controller) return
      // eslint-disable-next-line no-console
      console.warn(`[ai-cancel] aborting local stream thread=${threadId}`)
      controller.abort()
    })
    subscribed = true
  } catch (err) {
    initFailed = true
    // eslint-disable-next-line no-console
    console.warn(`[ai-cancel] psubscribe failed: ${(err as Error).message}`)
  }
}

/**
 * Track a per-thread AbortController locally so a pub/sub message can abort
 * it. Returns an unregister closure that the caller invokes from both the
 * abort listener and onFinish — first call wins via reference-equality.
 */
export function registerStreamController(
  threadId: string,
  controller: AbortController
): () => void {
  localControllers.set(threadId, controller)
  // Subscribe lazily — most of the time this is a no-op after the first call.
  ensureSubscribed().catch(() => {})
  return () => {
    if (localControllers.get(threadId) === controller) {
      localControllers.delete(threadId)
    }
  }
}

/**
 * Fan out a cancel request to every pod over Redis. Falls back to a local
 * abort when Redis is unavailable (still covers single-replica deployments).
 * Returns true when *some* pod (this or another) ended up aborting.
 */
export async function requestStreamCancel(threadId: string): Promise<boolean> {
  const local = localControllers.get(threadId)
  if (initFailed || !publisher) {
    if (local) {
      local.abort()
      return true
    }
    return false
  }
  try {
    await publisher.publish(`${CHANNEL_PREFIX}${threadId}`, '1')
    return true
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[ai-cancel] publish failed thread=${threadId}: ${(err as Error).message}`)
    if (local) {
      local.abort()
      return true
    }
    return false
  }
}
