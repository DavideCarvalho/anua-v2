import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'
import { updateLeaderboardValidator } from '#validators/gamification'

export default class UpdateLeaderboardController {
  async handle({ params, request, response }: HttpContext) {
    const leaderboard = await Leaderboard.find(params.id)

    if (!leaderboard) {
      return response.notFound({ message: 'Leaderboard não encontrado' })
    }

    const data = await request.validateUsing(updateLeaderboardValidator)

    leaderboard.merge(data)
    await leaderboard.save()

    return response.ok(leaderboard)
  }
}
