import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentBalanceTransaction from '#models/student_balance_transaction'
import type { DateTime } from 'luxon'

export default class StudentBalanceTransactionDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare amount: number
  declare type: 'TOP_UP' | 'CANTEEN_PURCHASE' | 'STORE_PURCHASE' | 'REFUND' | 'ADJUSTMENT'
  declare status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  declare description: string | null
  declare previousBalance: number
  declare newBalance: number
  declare canteenPurchaseId: string | null
  declare storeOrderId: string | null
  declare responsibleId: string | null
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: StudentBalanceTransaction) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.amount = model.amount
    this.type = model.type
    this.status = model.status
    this.description = model.description
    this.previousBalance = model.previousBalance
    this.newBalance = model.newBalance
    this.canteenPurchaseId = model.canteenPurchaseId
    this.storeOrderId = model.storeOrderId
    this.responsibleId = model.responsibleId
    this.paymentGatewayId = model.paymentGatewayId
    this.paymentMethod = model.paymentMethod
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
