import { BaseModelDto } from '@adocasts.com/dto/base'
import type Agreement from '#models/agreement'
import type { DateTime } from 'luxon'

export default class AgreementDto extends BaseModelDto {
  declare id: string
  declare totalAmount: number
  declare installments: number
  declare startDate: Date
  declare paymentDay: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(agreement?: Agreement) {
    super()

    if (!agreement) return

    this.id = agreement.id
    this.totalAmount = agreement.totalAmount
    this.installments = agreement.installments
    this.startDate = agreement.startDate.toJSDate()
    this.paymentDay = agreement.paymentDay
    this.createdAt = agreement.createdAt.toJSDate()
    this.updatedAt = agreement.updatedAt.toJSDate()
  }
}
