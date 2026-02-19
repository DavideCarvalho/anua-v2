import { BaseModelDto } from '@adocasts.com/dto/base'
import type Agreement from '#models/agreement'
import type { DateTime } from 'luxon'

export default class AgreementDto extends BaseModelDto {
  declare id: string
  declare totalAmount: number
  declare installments: number
  declare startDate: DateTime
  declare paymentDay: number
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(agreement?: Agreement) {
    super()

    if (!agreement) return

    this.id = agreement.id
    this.totalAmount = agreement.totalAmount
    this.installments = agreement.installments
    this.startDate = agreement.startDate
    this.paymentDay = agreement.paymentDay
    this.createdAt = agreement.createdAt
    this.updatedAt = agreement.updatedAt
  }
}
