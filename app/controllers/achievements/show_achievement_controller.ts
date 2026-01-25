import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import AchievementDto from '#models/dto/achievement.dto'

export default class ShowAchievementController {
  async handle({ params, response }: HttpContext) {
    const achievement = await Achievement.query().where('id', params.id).preload('school').first()

    if (!achievement) {
      return response.notFound({ message: 'Conquista nao encontrada' })
    }

    return new AchievementDto(achievement)
  }
}
