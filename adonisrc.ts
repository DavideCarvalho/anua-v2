import { defineConfig } from '@adonisjs/core/app'
import { indexEntities } from '@adonisjs/core'
import { indexPages } from '@adonisjs/inertia'
import { generateRegistry } from '@tuyau/core/hooks'

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
    () => import('adonisjs-scheduler/commands'),
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
    {
      file: () => import('adonisjs-scheduler/scheduler_provider'),
      environment: ['console'],
    },
    () => import('@stouder-io/adonis-auditing/auditing_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    {
      file: () => import('adonisjs-server-stats/provider'),
      environment: ['web'],
    },
    {
      file: () => import('adonisjs-server-stats/log-stream/provider'),
      environment: ['web'],
    },
    () => import('@adonisjs/otel/otel_provider'),
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
    () => import('#start/routes'),
    () => import('#start/kernel'),
    () => import('#start/orm'),
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
        timeout: 60000,
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
