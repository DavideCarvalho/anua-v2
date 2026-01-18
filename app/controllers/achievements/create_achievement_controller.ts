import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import type { AchievementType } from '#models/achievement'
import { createAchievementValidator } from '#validators/gamification'

// Map validator category to model type
const categoryToTypeMap: Record<string, AchievementType> = {
  ACADEMIC: 'ACADEMIC_PERFORMANCE',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class CreateAchievementController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAchievementValidator)

    const type = categoryToTypeMap[payload.category] || (payload.category as AchievementType)

    const achievement = await Achievement.create({
      name: payload.name,
      description: payload.description,
      iconUrl: payload.icon,
      pointsReward: payload.points,
      type,
      criteria: payload.criteria,
      isActive: payload.isActive ?? true,
      isRepeatable: false,
      schoolId: payload.schoolId,
      schoolChainId: payload.schoolChainId,
    })

    await achievement.load('school')

    return response.created(achievement)
  }
}
