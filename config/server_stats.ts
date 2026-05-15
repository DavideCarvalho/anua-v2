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

const isDev = env.get('NODE_ENV') === 'development'

// Sem logCollector, o log-stream provider do server-stats cai num fallback
// que faz poll de `logs/adonisjs.log`. Em prod o logger escreve direto pro
// stdout (config/logger.ts, destination: 1), então o arquivo nunca existe
// e o poll cuspia "ENOENT: no such file or directory" no stderr a cada 2s,
// afogando todos os logs reais no Guara. Registrar o logCollector sempre
// faz o provider usar o piggyback no Pino stream em vez do poll de arquivo:
//   - dev: passa logPath pro file polling (pino-roll escreve nesse arquivo)
//   - prod: sem logPath -> mode 'stream', start() é no-op, sem poll, sem spam
const collectors = [
  processCollector(),
  systemCollector(),
  httpCollector({ maxRecords: 10_000 }),
  dbPoolCollector({ connectionName: 'postgres' }),
  appCollector(),
  logCollector(isDev ? { logPath: 'logs/adonisjs.log' } : undefined),
]

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
