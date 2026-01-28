import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Worker } from '@boringnode/queue'
import { createServer } from 'node:http'
import queueConfig from '#config/queue'

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

    const queuesToProcess = this.queues?.length ? this.queues : ['default', 'gamification', 'payments']

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
      await worker.start(queuesToProcess)
      this.logger.info('Queue worker started successfully')
    } catch (error) {
      this.logger.error(`Failed to start queue worker: ${error}`)
      this.exitCode = 1
    }
  }
}
