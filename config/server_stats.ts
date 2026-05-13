import app from '@adonisjs/core/services/app'
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

if (!app.inProduction) {
  collectors.push(logCollector({ logPath: 'logs/adonisjs.log' }))
}

export default defineConfig({
  pollInterval: 3000,
  statsEndpoint: '/admin/api/server-stats',
  realtime: true,
  collectors,
  toolbar: !app.inProduction,
  dashboard: !app.inProduction,
  advanced: {
    channelName: 'admin/server-stats',
  },
  authorize: (_ctx) => !app.inProduction,
})
