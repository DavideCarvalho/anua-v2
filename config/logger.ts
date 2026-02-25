import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'
import { otelLoggingPreset } from '@adonisjs/otel/helpers'

const isLocalDevelopment = env.get('NODE_ENV') === 'development'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .pushIf(
            !app.inProduction,
            targets.pretty(otelLoggingPreset({ keep: ['trace_id', 'span_id'] }))
          )
          .pushIf(isLocalDevelopment, {
            target: 'pino-roll',
            level: env.get('LOG_LEVEL'),
            options: {
              file: app.makePath('logs', 'adonisjs.log'),
              frequency: 'daily',
              size: '20m',
              limit: {
                count: 7,
              },
              mkdir: true,
            },
          })
          .pushIf(
            !app.inProduction && !isLocalDevelopment,
            targets.file({
              destination: app.makePath('logs', 'adonisjs.log'),
              mkdir: true,
            })
          )
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
