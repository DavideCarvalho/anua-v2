import { BaseModelDto } from '@adocasts.com/dto/base'
import type OrderStatusHistory from '#models/order_status_history'
import type { OrderStatus } from '#models/order_status_history'
import type { DateTime } from 'luxon'

export default class OrderStatusHistoryDto extends BaseModelDto {
  declare id: string
  declare orderId: string
  declare fromStatus: OrderStatus | null
  declare toStatus: OrderStatus
  declare changedBy: string | null
  declare notes: string | null
  declare createdAt: DateTime

  constructor(orderStatusHistory?: OrderStatusHistory) {
    super()

    if (!orderStatusHistory) return

    this.id = orderStatusHistory.id
    this.orderId = orderStatusHistory.orderId
    this.fromStatus = orderStatusHistory.fromStatus
    this.toStatus = orderStatusHistory.toStatus
    this.changedBy = orderStatusHistory.changedBy
    this.notes = orderStatusHistory.notes
    this.createdAt = orderStatusHistory.createdAt
  }
}
