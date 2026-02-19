import { BaseModelDto } from '@adocasts.com/dto/base'
import type WalletTopUp from '#models/wallet_top_up'
import type { WalletTopUpStatus } from '#models/wallet_top_up'

export default class WalletTopUpDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare responsibleUserId: string
  declare amount: number
  declare status: WalletTopUpStatus
  declare paymentGateway: string
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare paidAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

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
    this.paidAt = model.paidAt ? model.paidAt.toJSDate() : null
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
