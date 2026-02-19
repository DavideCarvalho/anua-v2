import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolAchievementConfig from '#models/school_achievement_config'
import type { DateTime } from 'luxon'

export default class SchoolAchievementConfigDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare achievementId: string
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: SchoolAchievementConfig) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.achievementId = model.achievementId
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
