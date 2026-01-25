import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'

export default class ShowLeaderboardController {
  async handle({ params, response }: HttpContext) {
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
      return response.notFound({ message: 'Leaderboard não encontrado' })
    }

    return response.ok(leaderboard)
  }
}
