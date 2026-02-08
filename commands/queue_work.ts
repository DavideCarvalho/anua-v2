import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Worker, QueueManager } from '@boringnode/queue'
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
    const worker = new Worker(queueConfig)

    if (this.concurrency) {
      queueConfig.worker.concurrency = this.concurrency
    }

    const queuesToProcess = this.queues?.length
      ? this.queues
      : ['default', 'gamification', 'payments']

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

    healthServer.listen(healthPort)

    const shutdown = async () => {
      healthServer.close()
      await worker.stop()
      await db.manager.closeAll()
      await this.app.terminate()
      process.exit(0)
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    try {
      await worker.init()
      QueueManager.use()
      await worker.start(queuesToProcess)
    } catch (error) {
      this.logger.error(`Failed to start queue worker: ${error}`)
      console.error(error)
      this.exitCode = 1
    }
  }
}
