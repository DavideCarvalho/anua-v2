import type { HttpContext } from '@adonisjs/core/http'
import SchoolAchievementConfig from '#models/school_achievement_config'
import { updateSchoolAchievementConfigValidator } from '#validators/gamification'
import SchoolAchievementConfigTransformer from '#transformers/school_achievement_config_transformer'

export default class UpdateSchoolAchievementConfigController {
  async handle({ request, params, serialize }: HttpContext) {
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

    return { data: await serialize(SchoolAchievementConfigTransformer.transform(config)) }
  }
}
