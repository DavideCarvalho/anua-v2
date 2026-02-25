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

  async queries(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.queries(ctx)
  }

  async events(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.events(ctx)
  }

  async routes(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.routes(ctx)
  }

  async emails(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.emails(ctx)
  }

  async emailPreview(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.emailPreview(ctx)
  }

  async traces(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.traces(ctx)
  }

  async traceDetail(ctx: HttpContext) {
    const controller = await this.getController()
    return controller.traceDetail(ctx)
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
