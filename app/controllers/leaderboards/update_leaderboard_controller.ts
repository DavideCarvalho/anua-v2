import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Leaderboard from '#models/leaderboard'
import LeaderboardDto from '#models/dto/leaderboard.dto'
import { updateLeaderboardValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class UpdateLeaderboardController {
  async handle({ params, request, response }: HttpContext) {
    const leaderboard = await Leaderboard.find(params.id)

    if (!leaderboard) {
      throw AppException.notFound('Ranking não encontrado')
    }

    const data = await request.validateUsing(updateLeaderboardValidator)

    const updatedLeaderboard = await db.transaction(async (trx) => {
      leaderboard.merge({
        name: data.name ?? leaderboard.name,
        isActive: data.isActive ?? leaderboard.isActive,
      })
      await leaderboard.useTransaction(trx).save()
      return leaderboard
    })

    return response.ok(new LeaderboardDto(updatedLeaderboard))
  }
}
