import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import AchievementDto from '#models/dto/achievement.dto'
import AppException from '#exceptions/app_exception'

export default class ShowAchievementController {
  async handle({ params }: HttpContext) {
    const achievement = await Achievement.query().where('id', params.id).preload('school').first()

    if (!achievement) {
      throw AppException.notFound('Conquista não encontrada')
    }

    return new AchievementDto(achievement)
  }
}
