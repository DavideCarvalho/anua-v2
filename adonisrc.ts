import { defineConfig } from '@adonisjs/core/app'
import { indexEntities } from '@adonisjs/core'
import { indexPages } from '@adonisjs/inertia'
import { generateRegistry } from '@tuyau/core/hooks'
import env from '#start/env'

// Tira o server-stats inteiro em prod. Em prod:
//   - O dashboard é dev-only (`dashboard:` + `authorize:` em config/server_stats.ts)
//   - O log-stream provider polia `logs/adonisjs.log` que nunca existe (logger
//     escreve direto pro stdout via destination: 1 em config/logger.ts) e
//     spammava "ENOENT" no stderr a cada 2s, afogando os logs reais do Guara.
// Carregar zero providers de server-stats em prod resolve isso sem patch.
const isProduction = env.get('NODE_ENV') === 'production'
const webEnv: ('web' | 'console' | 'test' | 'repl')[] = ['web']

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Experimental flags
  |--------------------------------------------------------------------------
  |
  | The following features will be enabled by default in the next major release
  | of AdonisJS. You can opt into them today to avoid any breaking changes
  | during upgrade.
  |
  */
  experimental: {
    mergeMultipartFieldsAndFiles: true,
    shutdownInReverseOrder: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@adocasts.com/dto/commands'),
    () => import('@adonisjs/mail/commands'),
    () => import('@adonisjs/queue/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    () => import('#providers/transform_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/core/providers/edge_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/vite/vite_provider'),
    () => import('@adonisjs/shield/shield_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/inertia/inertia_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@adonisjs/cache/cache_provider'),
    () => import('@adonisjs/lock/lock_provider'),
    () => import('@adonisjs/drive/drive_provider'),
    () => import('@adonisjs/queue/queue_provider'),
    () => import('@jrmc/adonis-attachment/attachment_provider'),
    () => import('@adogrove/adonis-auditing/auditing_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    ...(isProduction
      ? []
      : [
          {
            file: () => import('adonisjs-server-stats/provider'),
            environment: webEnv,
          },
          {
            file: () => import('adonisjs-server-stats/log-stream/provider'),
            environment: webEnv,
          },
        ]),
    () => import('@adonisjs/otel/otel_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('@adonisjs/transmit/transmit_provider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    // orm tem que rodar PRIMEIRO. Ele seta BaseModel.namingStrategy =
    // PrismaNamingStrategy (camelCase), e os decorators @column resolvem
    // columnName no momento do load do model. Se routes/kernel rodarem
    // antes, eles importam models que ainda veem o SnakeCaseNamingStrategy
    // default e mapeiam coluna pra snake_case eternamente.
    () => import('#start/orm'),
    () => import('#start/routes'),
    () => import('#start/kernel'),
    {
      file: () => import('#start/scheduler'),
      environment: ['console'],
    },
  ],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['tests/functional/**/*.spec.{ts,js}'],
        name: 'functional',
        timeout: 30000,
      },
      {
        files: ['tests/browser/**/*.spec.{ts,js}'],
        name: 'browser',
        timeout: 180000,
      },
    ],
    forceExit: false,
  },

  /*
  |--------------------------------------------------------------------------
  | Metafiles
  |--------------------------------------------------------------------------
  |
  | A collection of files you want to copy to the build folder when creating
  | the production build.
  |
  */
  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],

  hooks: {
    init: [
      indexEntities({
        transformers: { enabled: true, withSharedProps: true },
      }),
      indexPages({ framework: 'react' }),
      generateRegistry(),
    ],
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
  directories: {
    audit_resolvers: 'app/audit_resolvers',
  },
})
