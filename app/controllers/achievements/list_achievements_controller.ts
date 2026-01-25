import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import { listAchievementsValidator } from '#validators/gamification'
import AchievementDto from '#models/dto/achievement.dto'

// Map validator category to model type
const categoryToTypeMap: Record<string, string> = {
  ACADEMIC: 'ACADEMIC_PERFORMANCE',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class ListAchievementsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listAchievementsValidator)

    const page = payload.page || 1
    const limit = payload.limit || 20

    const query = Achievement.query().orderBy('name', 'asc')

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    if (payload.category) {
      const type = categoryToTypeMap[payload.category] || payload.category
      query.where('type', type)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const achievements = await query.paginate(page, limit)

    return AchievementDto.fromPaginator(achievements)
  }
}
