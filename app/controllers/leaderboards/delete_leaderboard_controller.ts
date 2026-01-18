import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'

export default class DeleteLeaderboardController {
  async handle({ params, response }: HttpContext) {
    const leaderboard = await Leaderboard.find(params.id)

    if (!leaderboard) {
      return response.notFound({ message: 'Leaderboard não encontrado' })
    }

    // Cascade delete - entries will be deleted due to foreign key constraint
    // or soft delete by setting isActive to false
    await leaderboard.delete()

    return response.noContent()
  }
}
