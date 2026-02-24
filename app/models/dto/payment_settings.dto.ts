import { BaseModelDto } from '@adocasts.com/dto/base'
import type PaymentSettings from '#models/payment_settings'

export default class PaymentSettingsDto extends BaseModelDto {
  declare id: string
  declare pricePerStudent: number
  declare billingModel: 'PER_ACTIVE_STUDENT' | 'FIXED_MONTHLY'
  declare monthlyFixedPrice: number | null
  declare trialDays: number
  declare discount: number
  declare platformFeePercentage: number
  declare platformFeeMode: 'PERCENTAGE' | 'FIXED'
  declare platformFeeFixedAmount: number
  declare isActive: boolean
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(paymentSettings?: PaymentSettings) {
    super()

    if (!paymentSettings) return

    this.id = paymentSettings.id
    this.pricePerStudent = paymentSettings.pricePerStudent
    this.billingModel = paymentSettings.billingModel
    this.monthlyFixedPrice = paymentSettings.monthlyFixedPrice
    this.trialDays = paymentSettings.trialDays
    this.discount = paymentSettings.discount
    this.platformFeePercentage = paymentSettings.platformFeePercentage
    this.platformFeeMode = paymentSettings.platformFeeMode
    this.platformFeeFixedAmount = paymentSettings.platformFeeFixedAmount
    this.isActive = paymentSettings.isActive
    this.schoolId = paymentSettings.schoolId
    this.schoolChainId = paymentSettings.schoolChainId
    this.createdAt = paymentSettings.createdAt.toJSDate()
    this.updatedAt = paymentSettings.updatedAt.toJSDate()
  }
}
