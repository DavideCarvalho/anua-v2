import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import type { StatsEngine } from 'adonisjs-server-stats'

export default class GetServerStatsController {
  async handle({ response }: HttpContext) {
    const engine = (await app.container.make('server_stats.engine')) as StatsEngine
    return response.json(engine.getLatestStats())
  }
}
