import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreFinancialSettings from '#models/store_financial_settings'
import type { PixKeyType } from '#models/store_financial_settings'

export default class StoreFinancialSettingsDto extends BaseModelDto {
  declare id: string
  declare storeId: string
  declare platformFeePercentage: number | null
  declare pixKey: string | null
  declare pixKeyType: PixKeyType | null
  declare bankName: string | null
  declare accountHolder: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(settings?: StoreFinancialSettings) {
    super()

    if (!settings) return

    this.id = settings.id
    this.storeId = settings.storeId
    this.platformFeePercentage = settings.platformFeePercentage
    this.pixKey = settings.pixKey
    this.pixKeyType = settings.pixKeyType
    this.bankName = settings.bankName
    this.accountHolder = settings.accountHolder
    this.createdAt = settings.createdAt.toJSDate()
    this.updatedAt = settings.updatedAt.toJSDate()
  }
}
