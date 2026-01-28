import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { createServer } from 'node:http'
// @ts-expect-error - Worker is not exported in types but exists
import { Worker } from 'adonisjs-scheduler/build/src/worker.js'

export default class SchedulerWork extends BaseCommand {
  static commandName = 'scheduler:serve'
  static description = 'Start the scheduler with health check server for Cloud Run'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  @flags.string({ description: 'Tag for the scheduler', default: 'default' })
  declare tag: string

  private worker?: InstanceType<typeof Worker>

  prepare() {
    this.app.terminating(async () => {
      if (this.worker) await this.worker.stop()
    })
  }

  async run() {
    this.logger.info('Starting scheduler...')

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
    this.app.terminating(async () => {
      this.logger.info('Shutting down scheduler...')
      healthServer.close()
    })

    try {
      this.worker = new Worker(this.app)
      await this.worker.start(this.tag)
      this.logger.info('Scheduler started successfully')
    } catch (error) {
      this.logger.error(`Failed to start scheduler: ${error}`)
      this.exitCode = 1
    }
  }
}
