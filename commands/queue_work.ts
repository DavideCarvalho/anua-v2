import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Worker, QueueManager, Locator } from '@boringnode/queue'
import { createServer } from 'node:http'
import queueConfig from '#config/queue'
import db from '@adonisjs/lucid/services/db'

export default class QueueWork extends BaseCommand {
  static commandName = 'queue:work'
  static description = 'Start the queue worker to process jobs'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  @flags.array({ description: 'Queues to process (default: all)' })
  declare queues?: string[]

  @flags.number({ description: 'Number of concurrent jobs to process' })
  declare concurrency?: number

  async run() {
    this.logger.info('Starting queue worker...')

    const worker = new Worker(queueConfig)

    // Override concurrency if provided via flag
    if (this.concurrency) {
      queueConfig.worker.concurrency = this.concurrency
    }

    const queuesToProcess = this.queues?.length
      ? this.queues
      : ['default', 'gamification', 'payments']

    this.logger.info(`Processing queues: ${queuesToProcess.join(', ')}`)
    this.logger.info(`Concurrency: ${queueConfig.worker.concurrency}`)

    // Start a simple HTTP server for Cloud Run health checks
    // Cloud Run sets PORT=8080 by default
    const healthPort = process.env.PORT || 8080
    const healthServer = createServer((req, res) => {
      if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('OK')
      } else {
        res.writeHead(404)
        res.end('Not Found')
      }
    })

    healthServer.listen(healthPort, () => {
      this.logger.info(`Health check server listening on port ${healthPort}`)
    })

    // Handle graceful shutdown
    const shutdown = async () => {
      this.logger.info('Shutting down queue worker...')
      healthServer.close()
      await worker.stop()
      this.logger.info('Queue worker stopped')
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    try {
      // Log database connection info
      const env = await import('#start/env')
      this.logger.info(`DB_HOST: ${env.default.get('DB_HOST')}`)
      this.logger.info(`DB_DATABASE: ${env.default.get('DB_DATABASE')}`)

      // Test Lucid connection
      const jobCount = await db.from('queue_jobs').count('* as total')
      this.logger.info(`[Lucid] Jobs in queue_jobs: ${jobCount[0].total}`)

      // Initialize worker (this also initializes QueueManager internally)
      this.logger.info('Initializing worker (loading job handlers)...')
      await worker.init()

      // Get the adapter AFTER worker.init() to ensure we use the same instance as the worker
      const adapter = QueueManager.use()
      this.logger.info('QueueManager initialized via worker.init(), adapter obtained')

      // Debug: test if a specific job is registered
      const testJob = Locator.get('UpdateEnrollmentPaymentsJob')
      this.logger.info(`UpdateEnrollmentPaymentsJob registered: ${testJob ? 'YES' : 'NO'}`)

      // Add diagnostic polling - log EVERY run to track exactly what's happening
      let diagCounter = 0

      setInterval(async () => {
        diagCounter++
        try {
          // Query ALL jobs in the table
          const allJobs = await db.from('queue_jobs').select('id', 'queue', 'status', 'score')

          // Log every 5th check OR when jobs exist
          if (diagCounter % 5 === 0 || allJobs.length > 0) {
            this.logger.info(
              `[DIAG #${diagCounter}] Total jobs: ${allJobs.length}${allJobs.length > 0 ? ' → ' + JSON.stringify(allJobs.map((j: any) => ({ id: j.id.substring(0, 8), q: j.queue, s: j.status }))) : ''}`
            )
          }
        } catch (e) {
          this.logger.error(`[DIAG #${diagCounter}] Error: ${e}`)
        }
      }, 1000)

      this.logger.info('Starting worker...')
      await worker.start(queuesToProcess)
      this.logger.info('Queue worker stopped')
    } catch (error) {
      this.logger.error(`Failed to start queue worker: ${error}`)
      console.error(error)
      this.exitCode = 1
    }
  }
}
