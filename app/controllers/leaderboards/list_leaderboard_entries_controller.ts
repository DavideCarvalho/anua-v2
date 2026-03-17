import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'
import LeaderboardEntry from '#models/leaderboard_entry'
import AppException from '#exceptions/app_exception'
import LeaderboardEntryTransformer from '#transformers/leaderboard_entry_transformer'

export default class ListLeaderboardEntriesController {
  async handle({ params, request, response, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify leaderboard exists
    const leaderboard = await Leaderboard.find(params.id)

    if (!leaderboard) {
      throw AppException.notFound('Ranking não encontrado')
    }

    const entries = await LeaderboardEntry.query()
      .where('leaderboardId', params.id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('rank', 'asc')
      .paginate(page, limit)

    const items = entries.all()
    const metadata = entries.getMeta()

    return response.ok(await serialize(LeaderboardEntryTransformer.paginate(items, metadata)))
  }
}
