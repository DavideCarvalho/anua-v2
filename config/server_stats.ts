import env from '#start/env'
import { defineConfig } from 'adonisjs-server-stats'
import {
  appCollector,
  dbPoolCollector,
  httpCollector,
  processCollector,
  systemCollector,
  logCollector,
} from 'adonisjs-server-stats/collectors'

const collectors = [
  processCollector(),
  systemCollector(),
  httpCollector({ maxRecords: 10_000 }),
  dbPoolCollector({ connectionName: 'postgres' }),
  appCollector(),
]

if (env.get('NODE_ENV') === 'development') {
  collectors.push(logCollector({ logPath: 'logs/adonisjs.log' }))
}

export default defineConfig({
  pollInterval: 3000,
  statsEndpoint: '/admin/api/server-stats',
  realtime: true,
  collectors,
  toolbar: env.get('NODE_ENV') === 'development',
  dashboard: env.get('NODE_ENV') === 'development',
  advanced: {
    channelName: 'admin/server-stats',
  },
  authorize: (_ctx) => env.get('NODE_ENV') === 'development',
})
