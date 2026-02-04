import { BaseModelDto } from '@adocasts.com/dto/base'
import type PlatformSettings from '#models/platform_settings'
import type { DateTime } from 'luxon'

export default class PlatformSettingsDto extends BaseModelDto {
  declare id: string
  declare defaultTrialDays: number
  declare defaultPricePerStudent: number
  declare defaultStorePlatformFeePercentage: number
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: PlatformSettings) {
    super()

    if (!model) return

    this.id = model.id
    this.defaultTrialDays = model.defaultTrialDays
    this.defaultPricePerStudent = model.defaultPricePerStudent
    this.defaultStorePlatformFeePercentage = model.defaultStorePlatformFeePercentage
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
