import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'
import AppException from '#exceptions/app_exception'
import LeaderboardTransformer from '#transformers/leaderboard_transformer'

export default class ShowLeaderboardController {
  async handle({ params, response, serialize }: HttpContext) {
    const leaderboard = await Leaderboard.query()
      .where('id', params.id)
      .preload('school')
      .preload('entries', (entriesQuery) => {
        entriesQuery.orderBy('rank', 'asc').preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
      })
      .first()

    if (!leaderboard) {
      throw AppException.notFound('Ranking não encontrado')
    }

    return response.ok(await serialize(LeaderboardTransformer.transform(leaderboard)))
  }
}
