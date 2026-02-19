import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenFinancialSettings from '#models/canteen_financial_settings'
import type { PixKeyType } from '#models/canteen_financial_settings'

export default class CanteenFinancialSettingsDto extends BaseModelDto {
  declare id: string
  declare canteenId: string
  declare platformFeePercentage: number
  declare pixKey: string | null
  declare pixKeyType: PixKeyType | null
  declare bankName: string | null
  declare accountHolder: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(canteenFinancialSettings?: CanteenFinancialSettings) {
    super()

    if (!canteenFinancialSettings) return

    this.id = canteenFinancialSettings.id
    this.canteenId = canteenFinancialSettings.canteenId
    this.platformFeePercentage = canteenFinancialSettings.platformFeePercentage
    this.pixKey = canteenFinancialSettings.pixKey
    this.pixKeyType = canteenFinancialSettings.pixKeyType
    this.bankName = canteenFinancialSettings.bankName
    this.accountHolder = canteenFinancialSettings.accountHolder
    this.createdAt = canteenFinancialSettings.createdAt.toJSDate()
    this.updatedAt = canteenFinancialSettings.updatedAt.toJSDate()
  }
}
