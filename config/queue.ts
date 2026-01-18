import env from '#start/env'
import { knex } from '@boringnode/queue/drivers/knex_adapter'

const queueConfig = {
  /**
   * The default adapter to use for the queue.
   */
  default: 'knex',

  /**
   * Configure your queue adapters here.
   */
  adapters: {
    knex: knex({
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
    }),
  },

  /**
   * Worker configuration
   */
  worker: {
    concurrency: 5,
    pollingInterval: '100ms',
  },

  /**
   * Job locations for auto-discovery
   */
  locations: ['./app/jobs/**/*.js'],
}

export default queueConfig
