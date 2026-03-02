import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolAchievementConfig from '#models/school_achievement_config'
import SchoolTransformer from '#transformers/school_transformer'

export default class SchoolAchievementConfigTransformer extends BaseTransformer<SchoolAchievementConfig> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'achievementId',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
    }
  }
}
