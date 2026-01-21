import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import type { AchievementCategory } from '#models/achievement'
import { updateAchievementValidator } from '#validators/gamification'

// Map validator category to model category
const categoryMap: Record<string, AchievementCategory> = {
  ACADEMIC: 'ACADEMIC_PERFORMANCE',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class UpdateAchievementController {
  async handle({ params, request, response }: HttpContext) {
    const achievement = await Achievement.find(params.id)

    if (!achievement) {
      return response.notFound({ message: 'Conquista nao encontrada' })
    }

    const payload = await request.validateUsing(updateAchievementValidator)

    if (payload.name !== undefined) {
      achievement.name = payload.name
    }
    if (payload.description !== undefined) {
      achievement.description = payload.description
    }
    if (payload.icon !== undefined) {
      achievement.icon = payload.icon
    }
    if (payload.points !== undefined) {
      achievement.points = payload.points
    }
    if (payload.category !== undefined) {
      const category = categoryMap[payload.category] || (payload.category as AchievementCategory)
      achievement.category = category
    }
    if (payload.criteria !== undefined) {
      achievement.criteria = payload.criteria
    }
    if (payload.isActive !== undefined) {
      achievement.isActive = payload.isActive
    }

    await achievement.save()

    return response.ok(achievement)
  }
}
