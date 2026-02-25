import { defineConfig, destinations } from '@adonisjs/otel'
import env from '#start/env'
import { isEnabled as isEvlogEnabled, log as evlogLog } from 'evlog'

const otelExportTarget = env.get('OTEL_EXPORT_TARGET') ?? 'collector'
const posthogProjectToken = env.get('POSTHOG_PROJECT_TOKEN')
const posthogOtelEndpointBase =
  env.get('POSTHOG_OTEL_ENDPOINT_BASE') ?? 'https://us.i.posthog.com/i'
const localCollectorEndpoint = env.get('OTEL_COLLECTOR_ENDPOINT') ?? 'http://localhost:4318'

function resolveEvlogLevel(level: unknown): 'info' | 'warn' | 'error' | 'debug' {
  if (typeof level === 'number') {
    if (level >= 50) return 'error'
    if (level >= 40) return 'warn'
    if (level >= 30) return 'info'
    return 'debug'
  }

  if (typeof level === 'string') {
    if (level === 'error' || level === 'warn' || level === 'info' || level === 'debug') {
      return level
    }
  }

  return 'info'
}

function forwardPinoRecordToEvlog(record: Record<string, unknown>) {
  if (!isEvlogEnabled()) {
    return
  }

  const {
    level,
    msg,
    message,
    pid: ignoredPid,
    hostname: ignoredHostname,
    time: ignoredTime,
    ...context
  } = record

  void ignoredPid
  void ignoredHostname
  void ignoredTime

  const normalizedLevel = resolveEvlogLevel(level)
  const normalizedMessage =
    typeof msg === 'string' ? msg : typeof message === 'string' ? message : 'application log'

  evlogLog[normalizedLevel]({
    source: 'adonis_logger',
    message: normalizedMessage,
    ...context,
  })
}

function resolveDestinations():
  | Record<string, ReturnType<(typeof destinations)['otlp']>>
  | undefined {
  if (otelExportTarget === 'posthog') {
    if (!posthogProjectToken) {
      return undefined
    }

    return {
      posthog: destinations.otlp({
        endpoint: posthogOtelEndpointBase,
        signals: ['traces'],
        headers: {
          Authorization: `Bearer ${posthogProjectToken}`,
        },
      }),
    }
  }

  if (otelExportTarget === 'collector') {
    return {
      collector: destinations.otlp({
        endpoint: localCollectorEndpoint,
        signals: ['traces'],
      }),
    }
  }

  return undefined
}

export default defineConfig({
  serviceName: process.env.OTEL_SERVICE_NAME ?? env.get('APP_NAME') ?? 'Anua',
  serviceVersion: process.env.APP_VERSION ?? env.get('APP_VERSION') ?? '0.0.0',
  environment: process.env.APP_ENV ?? env.get('NODE_ENV'),
  instrumentations: {
    '@opentelemetry/instrumentation-pino': {
      logHook: (_span, record) => {
        forwardPinoRecordToEvlog(record as Record<string, unknown>)
      },
    },
  },
  destinations: resolveDestinations(),
})
