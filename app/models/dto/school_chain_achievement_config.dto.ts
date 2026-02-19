import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolChainAchievementConfig from '#models/school_chain_achievement_config'
import type { DateTime } from 'luxon'

export default class SchoolChainAchievementConfigDto extends BaseModelDto {
  declare id: string
  declare schoolChainId: string
  declare achievementId: string
  declare isActive: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: SchoolChainAchievementConfig) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolChainId = model.schoolChainId
    this.achievementId = model.achievementId
    this.isActive = model.isActive
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
