/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  APP_NAME: Env.schema.string.optional(),
  APP_VERSION: Env.schema.string.optional(),
  EVLOG_ENABLED: Env.schema.boolean.optional(),
  EVLOG_DRAIN_TARGET: Env.schema.enum.optional(['none', 'posthog'] as const),
  EVLOG_POSTHOG_HOST: Env.schema.string.optional(),
  OTEL_EXPORT_TARGET: Env.schema.enum.optional(['collector', 'posthog', 'disabled'] as const),
  OTEL_COLLECTOR_ENDPOINT: Env.schema.string.optional(),
  POSTHOG_PROJECT_TOKEN: Env.schema.string.optional(),
  POSTHOG_OTEL_ENDPOINT_BASE: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_POOL_MAX: Env.schema.number.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USER: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
  SMTP_FROM_EMAIL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 'gcs'] as const),
  GCS_BUCKET: Env.schema.string.optional(),
  GCS_KEY_FILENAME: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Asaas payment gateway
  |----------------------------------------------------------
  */
  ASAAS_API_KEY: Env.schema.string(),
  ASAAS_WEBHOOK_URL: Env.schema.string(),
  ASAAS_WEBHOOK_TOKEN: Env.schema.string(),
})
