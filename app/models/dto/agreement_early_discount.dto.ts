import { BaseModelDto } from '@adocasts.com/dto/base'
import type AgreementEarlyDiscount from '#models/agreement_early_discount'
import type { DateTime } from 'luxon'

export default class AgreementEarlyDiscountDto extends BaseModelDto {
  declare id: string
  declare agreementId: string
  declare percentage: number
  declare daysBeforeDeadline: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(agreementEarlyDiscount?: AgreementEarlyDiscount) {
    super()

    if (!agreementEarlyDiscount) return

    this.id = agreementEarlyDiscount.id
    this.agreementId = agreementEarlyDiscount.agreementId
    this.percentage = agreementEarlyDiscount.percentage
    this.daysBeforeDeadline = agreementEarlyDiscount.daysBeforeDeadline
    this.createdAt = agreementEarlyDiscount.createdAt.toJSDate()
    this.updatedAt = agreementEarlyDiscount.updatedAt.toJSDate()
  }
}
