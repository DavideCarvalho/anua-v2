import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreOrderItem from '#models/store_order_item'
import type { PaymentMode } from '#models/store_order_item'
import type { DateTime } from 'luxon'

export default class StoreOrderItemDto extends BaseModelDto {
  declare id: string
  declare orderId: string
  declare storeItemId: string
  declare quantity: number
  declare unitPrice: number
  declare paymentMode: PaymentMode
  declare pointsToMoneyRate: number
  declare pointsPaid: number
  declare moneyPaid: number
  declare itemName: string
  declare itemDescription: string | null
  declare itemImageUrl: string | null
  declare createdAt: Date

  constructor(model?: StoreOrderItem) {
    super()

    if (!model) return

    this.id = model.id
    this.orderId = model.orderId
    this.storeItemId = model.storeItemId
    this.quantity = model.quantity
    this.unitPrice = model.unitPrice
    this.paymentMode = model.paymentMode
    this.pointsToMoneyRate = model.pointsToMoneyRate
    this.pointsPaid = model.pointsPaid
    this.moneyPaid = model.moneyPaid
    this.itemName = model.itemName
    this.itemDescription = model.itemDescription
    this.itemImageUrl = model.itemImageUrl
    this.createdAt = model.createdAt.toJSDate()
  }
}
