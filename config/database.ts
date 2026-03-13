import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      pool: {
        min: 0,
        max: env.get('DB_POOL_MAX', 3),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: !app.inProduction,
    },
  },
})

export default dbConfig
