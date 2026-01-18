import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'
import LeaderboardEntry from '#models/leaderboard_entry'

export default class ListLeaderboardEntriesController {
  async handle({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify leaderboard exists
    const leaderboard = await Leaderboard.find(params.id)

    if (!leaderboard) {
      return response.notFound({ message: 'Leaderboard não encontrado' })
    }

    const entries = await LeaderboardEntry.query()
      .where('leaderboardId', params.id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('rank', 'asc')
      .paginate(page, limit)

    return response.ok(entries)
  }
}
