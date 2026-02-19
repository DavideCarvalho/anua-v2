import { BaseModelDto } from '@adocasts.com/dto/base'
import type PaymentStatusHistory from '#models/payment_status_history'
import type { PaymentStatus } from '#models/payment_status_history'
import type { DateTime } from 'luxon'

export default class PaymentStatusHistoryDto extends BaseModelDto {
  declare id: string
  declare paymentId: string
  declare previousStatus: PaymentStatus
  declare newStatus: PaymentStatus
  declare changedBy: string
  declare observation: string | null
  declare changedAt: Date

  constructor(model?: PaymentStatusHistory) {
    super()

    if (!model) return

    this.id = model.id
    this.paymentId = model.paymentId
    this.previousStatus = model.previousStatus
    this.newStatus = model.newStatus
    this.changedBy = model.changedBy
    this.observation = model.observation
    this.changedAt = model.changedAt.toJSDate()
  }
}
