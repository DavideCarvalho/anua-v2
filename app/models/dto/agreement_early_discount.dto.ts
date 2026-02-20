import { BaseModelDto } from '@adocasts.com/dto/base'
import type AgreementEarlyDiscount from '#models/agreement_early_discount'

export default class AgreementEarlyDiscountDto extends BaseModelDto {
  declare id: string
  declare agreementId: string
  declare discountType: 'PERCENTAGE' | 'FLAT'
  declare percentage: number | null
  declare flatAmount: number | null
  declare daysBeforeDeadline: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(agreementEarlyDiscount?: AgreementEarlyDiscount) {
    super()

    if (!agreementEarlyDiscount) return

    this.id = agreementEarlyDiscount.id
    this.agreementId = agreementEarlyDiscount.agreementId
    this.discountType = agreementEarlyDiscount.discountType
    this.percentage = agreementEarlyDiscount.percentage
    this.flatAmount = agreementEarlyDiscount.flatAmount
    this.daysBeforeDeadline = agreementEarlyDiscount.daysBeforeDeadline
    this.createdAt = agreementEarlyDiscount.createdAt.toJSDate()
    this.updatedAt = agreementEarlyDiscount.updatedAt.toJSDate()
  }
}
