import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { readFile } from 'node:fs/promises'
import type { DebugStore } from 'adonisjs-server-stats/debug'
import DebugController from 'adonisjs-server-stats/debug/controller'

export default class AdminDebugController {
  private async getController() {
    const store = (await app.container.make('debug.store')) as DebugStore
    return new DebugController(store)
  }

  async config(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.config(ctx)
  }

  async diagnostics(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.diagnostics(ctx)
  }

  async logs({ response }: HttpContext) {
    const logPath = app.makePath('logs', 'adonisjs.log')

    try {
      const content = await readFile(logPath, 'utf8')
      const entries = content
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(-200)
        .map((line) => {
          try {
            return JSON.parse(line)
          } catch {
            return { levelName: 'info', msg: line }
          }
        })

      return response.json({ logs: entries })
    } catch {
      return response.json({ logs: [] })
    }
  }
}
