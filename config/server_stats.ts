import app from '@adonisjs/core/services/app'
import { defineConfig } from 'adonisjs-server-stats'
import {
  appCollector,
  dbPoolCollector,
  httpCollector,
  logCollector,
  processCollector,
  systemCollector,
} from 'adonisjs-server-stats/collectors'

export default defineConfig({
  pollInterval: 3000,
  statsEndpoint: '/admin/api/server-stats',
  realtime: false,
  collectors: [
    processCollector(),
    systemCollector(),
    httpCollector({ maxRecords: 10_000 }),
    dbPoolCollector({ connectionName: 'postgres' }),
    logCollector({ logPath: 'logs/adonisjs.log' }),
    appCollector(),
  ],
  toolbar: {
    tracing: true,
    slowQueryThreshold: 100,
    persist: true,
  },
  dashboard: true,
  advanced: {
    channelName: 'admin/server-stats',
  },
  authorize: (_ctx) => !app.inProduction,
})
