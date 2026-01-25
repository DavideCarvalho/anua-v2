import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'

export default class DeleteAchievementController {
  async handle({ params, response }: HttpContext) {
    const achievement = await Achievement.find(params.id)

    if (!achievement) {
      return response.notFound({ message: 'Conquista nao encontrada' })
    }

    // Soft delete by setting isActive to false
    // Note: The Achievement model doesn't have a deletedAt column,
    // so we deactivate it instead
    achievement.isActive = false
    await achievement.save()
  }
}
