import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'

export default class SchedulerServe extends BaseCommand {
  static commandName = 'scheduler:serve'
  static description = 'Start the scheduler with health check server for Cloud Run'

  static options: CommandOptions = {
    startApp: false,
    staysAlive: true,
  }

  async run() {
    this.logger.info('Starting scheduler with health check server...')

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

    // Spawn the actual scheduler:run command
    const scheduler = spawn('node', ['ace', 'scheduler:run'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    scheduler.on('error', (error) => {
      this.logger.error(`Failed to start scheduler: ${error}`)
      this.exitCode = 1
    })

    scheduler.on('exit', (code) => {
      this.logger.info(`Scheduler exited with code ${code}`)
      healthServer.close()
      process.exit(code || 0)
    })

    // Handle graceful shutdown
    const shutdown = () => {
      this.logger.info('Shutting down...')
      scheduler.kill('SIGTERM')
      healthServer.close()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }
}
