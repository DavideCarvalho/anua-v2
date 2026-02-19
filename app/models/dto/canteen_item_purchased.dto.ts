import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenItemPurchased from '#models/canteen_item_purchased'

export default class CanteenItemPurchasedDto extends BaseModelDto {
  declare id: string
  declare canteenPurchaseId: string
  declare canteenItemId: string
  declare quantity: number
  declare unitPrice: number
  declare totalPrice: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(canteenItemPurchased?: CanteenItemPurchased) {
    super()

    if (!canteenItemPurchased) return

    this.id = canteenItemPurchased.id
    this.canteenPurchaseId = canteenItemPurchased.canteenPurchaseId
    this.canteenItemId = canteenItemPurchased.canteenItemId
    this.quantity = canteenItemPurchased.quantity
    this.unitPrice = canteenItemPurchased.unitPrice
    this.totalPrice = canteenItemPurchased.totalPrice
    this.createdAt = canteenItemPurchased.createdAt.toJSDate()
    this.updatedAt = canteenItemPurchased.updatedAt.toJSDate()
  }
}
