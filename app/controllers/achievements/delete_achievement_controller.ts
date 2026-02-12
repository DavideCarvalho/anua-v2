import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import AppException from '#exceptions/app_exception'

export default class DeleteAchievementController {
  async handle({ params }: HttpContext) {
    const achievement = await Achievement.find(params.id)

    if (!achievement) {
      throw AppException.notFound('Conquista não encontrada')
    }

    // Soft delete by setting isActive to false
    // Note: The Achievement model doesn't have a deletedAt column,
    // so we deactivate it instead
    achievement.isActive = false
    await achievement.save()
  }
}
