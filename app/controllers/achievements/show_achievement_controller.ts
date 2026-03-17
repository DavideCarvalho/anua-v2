import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import AppException from '#exceptions/app_exception'
import AchievementTransformer from '#transformers/achievement_transformer'

export default class ShowAchievementController {
  async handle({ params, serialize }: HttpContext) {
    const achievement = await Achievement.query().where('id', params.id).preload('school').first()

    if (!achievement) {
      throw AppException.notFound('Conquista não encontrada')
    }

    return serialize(AchievementTransformer.transform(achievement))
  }
}
