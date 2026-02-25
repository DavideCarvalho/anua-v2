import { defineConfig, destinations } from '@adonisjs/otel'
import env from '#start/env'

const otelExportTarget = env.get('OTEL_EXPORT_TARGET') ?? 'collector'
const posthogProjectToken = env.get('POSTHOG_PROJECT_TOKEN')
const posthogOtelEndpointBase =
  env.get('POSTHOG_OTEL_ENDPOINT_BASE') ?? 'https://us.i.posthog.com/i'
const localCollectorEndpoint = env.get('OTEL_COLLECTOR_ENDPOINT') ?? 'http://localhost:4318'

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
        signals: ['traces', 'logs'],
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
        signals: ['traces', 'logs'],
      }),
    }
  }

  return undefined
}

export default defineConfig({
  serviceName: process.env.OTEL_SERVICE_NAME ?? env.get('APP_NAME') ?? 'Anua',
  serviceVersion: process.env.APP_VERSION ?? env.get('APP_VERSION') ?? '0.0.0',
  environment: process.env.APP_ENV ?? env.get('NODE_ENV'),
  destinations: resolveDestinations(),
})
