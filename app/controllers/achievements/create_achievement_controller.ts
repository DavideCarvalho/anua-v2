import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import type { AchievementCategory } from '#models/achievement'
import { createAchievementValidator } from '#validators/gamification'

// Map validator category to model category
const categoryMap: Record<string, AchievementCategory> = {
  ACADEMIC: 'ACADEMIC_PERFORMANCE',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class CreateAchievementController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAchievementValidator)

    const category = categoryMap[payload.category] || (payload.category as AchievementCategory)

    const achievement = await Achievement.create({
      name: payload.name,
      description: payload.description,
      icon: payload.icon,
      points: payload.points,
      category,
      criteria: payload.criteria,
      isActive: payload.isActive ?? true,
      schoolId: payload.schoolId,
      schoolChainId: payload.schoolChainId,
    })

    await achievement.load('school')

    return response.created(achievement)
  }
}
