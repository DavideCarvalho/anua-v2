import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenItemPurchased from '#models/canteen_item_purchased'

export default class CanteenItemPurchasedTransformer extends BaseTransformer<CanteenItemPurchased> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenPurchaseId',
        'canteenItemId',
        'quantity',
        'unitPrice',
        'totalPrice',
        'createdAt',
        'updatedAt',
      ]),
    }
  }
}
