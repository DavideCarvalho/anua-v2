import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreOrder from '#models/store_order'
import type { StoreOrderStatus } from '#models/store_order'
import type { DateTime } from 'luxon'
import StudentDto from './student.dto.js'

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
  declare paidAt: Date | null
  declare approvedAt: Date | null
  declare preparingAt: Date | null
  declare readyAt: Date | null
  declare deliveredAt: Date | null
  declare canceledAt: Date | null
  declare estimatedReadyAt: Date | null
  declare studentNotes: string | null
  declare internalNotes: string | null
  declare cancellationReason: string | null
  declare approvedBy: string | null
  declare preparedBy: string | null
  declare deliveredBy: string | null
  declare paymentMode: 'IMMEDIATE' | 'DEFERRED' | null
  declare paymentMethod: 'BALANCE' | 'PIX' | 'CASH' | 'CARD' | null
  declare settlementId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare student?: StudentDto

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
    this.paidAt = model.paidAt?.toJSDate() ?? null
    this.approvedAt = model.approvedAt?.toJSDate() ?? null
    this.preparingAt = model.preparingAt?.toJSDate() ?? null
    this.readyAt = model.readyAt?.toJSDate() ?? null
    this.deliveredAt = model.deliveredAt?.toJSDate() ?? null
    this.canceledAt = model.canceledAt?.toJSDate() ?? null
    this.estimatedReadyAt = model.estimatedReadyAt?.toJSDate() ?? null
    this.studentNotes = model.studentNotes
    this.internalNotes = model.internalNotes
    this.cancellationReason = model.cancellationReason
    this.approvedBy = model.approvedBy
    this.preparedBy = model.preparedBy
    this.deliveredBy = model.deliveredBy
    this.paymentMode = model.paymentMode
    this.paymentMethod = model.paymentMethod
    this.settlementId = model.settlementId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.student = model.student ? new StudentDto(model.student) : undefined
  }
}
