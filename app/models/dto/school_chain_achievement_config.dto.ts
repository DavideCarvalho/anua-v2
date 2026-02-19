import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolChainAchievementConfig from '#models/school_chain_achievement_config'

export default class SchoolChainAchievementConfigDto extends BaseModelDto {
  declare id: string
  declare schoolChainId: string
  declare achievementId: string
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: SchoolChainAchievementConfig) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolChainId = model.schoolChainId
    this.achievementId = model.achievementId
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
