import env from '#start/env'
import { initLogger } from 'evlog'
import type { DrainContext } from 'evlog'
import { createPostHogDrain } from 'evlog/posthog'
import { createDrainPipeline } from 'evlog/pipeline'

const isDev = env.get('NODE_ENV') === 'development'
const evlogEnabled = env.get('EVLOG_ENABLED') ?? isDev
const evlogDrainTarget = env.get('EVLOG_DRAIN_TARGET') ?? 'none'
const posthogApiKey = env.get('POSTHOG_PROJECT_TOKEN')
const posthogHost = env.get('EVLOG_POSTHOG_HOST') ?? 'https://us.i.posthog.com'

const baseConfig = {
  enabled: evlogEnabled,
  pretty: isDev,
  env: {
    service: env.get('OTEL_SERVICE_NAME') ?? env.get('APP_NAME') ?? 'Anua',
    environment: env.get('NODE_ENV'),
    version: env.get('APP_VERSION'),
  },
}

if (evlogDrainTarget === 'posthog' && posthogApiKey) {
  const pipeline = createDrainPipeline<DrainContext>({
    batch: { size: 50, intervalMs: 5000 },
    retry: { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 1000 },
    maxBufferSize: 1000,
  })
  const posthogDrain = createPostHogDrain({
    apiKey: posthogApiKey,
    host: posthogHost,
    timeout: 15000,
  })
  const drain = pipeline(async (batch: DrainContext[]) => {
    await posthogDrain(batch)
  })

  initLogger({
    ...baseConfig,
    drain,
  })

  process.once('beforeExit', () => {
    void drain.flush()
  })
} else {
  initLogger(baseConfig)
}
