import type { HttpContext } from '@adonisjs/core/http'
import SchoolAchievementConfig from '#models/school_achievement_config'
import SchoolAchievementConfigDto from '#models/dto/school_achievement_config.dto'
import { updateSchoolAchievementConfigValidator } from '#validators/gamification'

export default class UpdateSchoolAchievementConfigController {
  async handle({ request, params }: HttpContext) {
    const { achievementId, schoolId } = params
    const payload = await request.validateUsing(updateSchoolAchievementConfigValidator)

    let config = await SchoolAchievementConfig.query()
      .where('achievementId', achievementId)
      .where('schoolId', schoolId)
      .first()

    if (!config) {
      config = new SchoolAchievementConfig()
      config.achievementId = achievementId
      config.schoolId = schoolId
      config.isActive = payload.isActive
      await config.save()
    } else {
      config.isActive = payload.isActive
      await config.save()
    }

    return { data: new SchoolAchievementConfigDto(config) }
  }
}
