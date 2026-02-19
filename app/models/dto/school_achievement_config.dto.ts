import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolAchievementConfig from '#models/school_achievement_config'
import type { DateTime } from 'luxon'

export default class SchoolAchievementConfigDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare achievementId: string
  declare isActive: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: SchoolAchievementConfig) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.achievementId = model.achievementId
    this.isActive = model.isActive
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
