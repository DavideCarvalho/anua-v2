import { BaseModelDto } from '@adocasts.com/dto/base'
import type WalletTopUp from '#models/wallet_top_up'
import type { WalletTopUpStatus } from '#models/wallet_top_up'
import type { DateTime } from 'luxon'

export default class WalletTopUpDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare responsibleUserId: string
  declare amount: number
  declare status: WalletTopUpStatus
  declare paymentGateway: string
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare paidAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: WalletTopUp) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.responsibleUserId = model.responsibleUserId
    this.amount = model.amount
    this.status = model.status
    this.paymentGateway = model.paymentGateway
    this.paymentGatewayId = model.paymentGatewayId
    this.paymentMethod = model.paymentMethod
    this.paidAt = model.paidAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
