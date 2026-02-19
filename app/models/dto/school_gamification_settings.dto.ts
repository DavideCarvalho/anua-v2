import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolGamificationSettings from '#models/school_gamification_settings'
import type { DateTime } from 'luxon'

export default class SchoolGamificationSettingsDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare pointsToMoneyRate: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: SchoolGamificationSettings) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.pointsToMoneyRate = model.pointsToMoneyRate
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
