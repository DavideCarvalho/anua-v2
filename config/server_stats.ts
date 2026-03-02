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
  intervalMs: 3000,
  channelName: 'admin/server-stats',
  endpoint: '/admin/api/server-stats',
  transport: 'none',
  collectors: [
    processCollector(),
    systemCollector(),
    httpCollector({ maxRecords: 10_000 }),
    dbPoolCollector({ connectionName: 'postgres' }),
    logCollector({ logPath: 'logs/adonisjs.log' }),
    appCollector(),
  ],
  devToolbar: {
    enabled: true,
    tracing: true,
    dashboard: true,
    slowQueryThresholdMs: 100,
    persistDebugData: true,
  },
  shouldShow: (_ctx) => !app.inProduction,
})
