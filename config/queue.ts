import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: env.get('QUEUE_DRIVER', env.get('NODE_ENV') === 'development' ? 'sync' : 'database'),

  adapters: {
    database: drivers.database({
      connectionName: 'postgres',
    }),
    sync: drivers.sync(),
  },

  worker: {
    concurrency: 2,
    idleDelay: '1s',
  },

  locations: ['./app/jobs/**/*.ts'],
})
