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

    const scheduler = spawn('node', ['ace', 'scheduler:run'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    scheduler.on('error', (error) => {
      this.logger.error(`Failed to start scheduler: ${error}`)
      this.exitCode = 1
    })

    scheduler.on('exit', (code) => {
      healthServer.close()
      process.exit(code || 0)
    })

    const shutdown = () => {
      scheduler.kill('SIGTERM')
      healthServer.close()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }
}
