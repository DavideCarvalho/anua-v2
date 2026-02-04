import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreOrder from '#models/store_order'
import type { StoreOrderStatus } from '#models/store_order'
import type { DateTime } from 'luxon'

export default class StoreOrderDto extends BaseModelDto {
  declare id: string
  declare orderNumber: string
  declare studentId: string
  declare schoolId: string
  declare storeId: string | null
  declare status: StoreOrderStatus
  declare totalPrice: number
  declare totalPoints: number
  declare totalMoney: number
  declare paidAt: DateTime | null
  declare approvedAt: DateTime | null
  declare preparingAt: DateTime | null
  declare readyAt: DateTime | null
  declare deliveredAt: DateTime | null
  declare canceledAt: DateTime | null
  declare estimatedReadyAt: DateTime | null
  declare studentNotes: string | null
  declare internalNotes: string | null
  declare cancellationReason: string | null
  declare approvedBy: string | null
  declare preparedBy: string | null
  declare deliveredBy: string | null
  declare paymentMode: 'IMMEDIATE' | 'DEFERRED' | null
  declare paymentMethod: 'BALANCE' | 'PIX' | 'CASH' | 'CARD' | null
  declare settlementId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StoreOrder) {
    super()

    if (!model) return

    this.id = model.id
    this.orderNumber = model.orderNumber
    this.studentId = model.studentId
    this.schoolId = model.schoolId
    this.storeId = model.storeId
    this.status = model.status
    this.totalPrice = model.totalPrice
    this.totalPoints = model.totalPoints
    this.totalMoney = model.totalMoney
    this.paidAt = model.paidAt
    this.approvedAt = model.approvedAt
    this.preparingAt = model.preparingAt
    this.readyAt = model.readyAt
    this.deliveredAt = model.deliveredAt
    this.canceledAt = model.canceledAt
    this.estimatedReadyAt = model.estimatedReadyAt
    this.studentNotes = model.studentNotes
    this.internalNotes = model.internalNotes
    this.cancellationReason = model.cancellationReason
    this.approvedBy = model.approvedBy
    this.preparedBy = model.preparedBy
    this.deliveredBy = model.deliveredBy
    this.paymentMode = model.paymentMode
    this.paymentMethod = model.paymentMethod
    this.settlementId = model.settlementId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
