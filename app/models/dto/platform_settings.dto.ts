import { BaseModelDto } from '@adocasts.com/dto/base'
import type PlatformSettings from '#models/platform_settings'

export default class PlatformSettingsDto extends BaseModelDto {
  declare id: string
  declare defaultTrialDays: number
  declare defaultPricePerStudent: number
  declare defaultStorePlatformFeePercentage: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: PlatformSettings) {
    super()

    if (!model) return

    this.id = model.id
    this.defaultTrialDays = model.defaultTrialDays
    this.defaultPricePerStudent = model.defaultPricePerStudent
    this.defaultStorePlatformFeePercentage = model.defaultStorePlatformFeePercentage
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
