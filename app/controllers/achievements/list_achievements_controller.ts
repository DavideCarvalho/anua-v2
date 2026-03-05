import type { HttpContext } from '@adonisjs/core/http'
import Achievement from '#models/achievement'
import SchoolAchievementConfig from '#models/school_achievement_config'
import AchievementTransformer from '#transformers/achievement_transformer'
import SchoolAchievementConfigTransformer from '#transformers/school_achievement_config_transformer'
import { listAchievementsValidator } from '#validators/gamification'

const categoryToTypeMap: Record<string, string> = {
  ACADEMIC: 'ACADEMIC_PERFORMANCE',
  ATTENDANCE: 'ATTENDANCE',
  BEHAVIOR: 'BEHAVIOR',
  SOCIAL: 'SOCIAL',
  SPECIAL: 'SPECIAL',
}

export default class ListAchievementsController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listAchievementsValidator)

    const page = payload.page || 1
    const limit = payload.limit || 20

    const query = Achievement.query().orderBy('name', 'asc').preload('school')

    if (payload.schoolId) {
      const schoolId = payload.schoolId
      query.where((q) => {
        q.where('schoolId', schoolId).orWhereNull('schoolId').orWhereNotNull('schoolChainId')
      })
    } else {
      query.whereNull('schoolId').whereNull('schoolChainId')
    }

    if (payload.category) {
      const type = categoryToTypeMap[payload.category] || payload.category
      query.where('category', type)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const achievements = await query.paginate(page, limit)
    const data = achievements.all()
    const metadata = achievements.getMeta()

    let configByAchievementId: Map<string, SchoolAchievementConfig> = new Map()
    if (payload.schoolId && data.some((a) => a.schoolChainId)) {
      const achievementIds = data.filter((a) => a.schoolChainId).map((a) => a.id)
      const configs = await SchoolAchievementConfig.query()
        .whereIn('achievementId', achievementIds)
        .where('schoolId', payload.schoolId)
      for (const config of configs) {
        configByAchievementId.set(config.achievementId, config)
      }
    }

    const paginated = await serialize(AchievementTransformer.paginate(data, metadata))

    if (configByAchievementId.size === 0) {
      return paginated
    }

    return {
      ...paginated,
      data: paginated.data.map((item) => {
        const config = configByAchievementId.get(item.id)
        return {
          ...item,
          schoolAchievementConfig: config
            ? SchoolAchievementConfigTransformer.transform(config)
            : undefined,
        }
      }),
    }
  }
}
