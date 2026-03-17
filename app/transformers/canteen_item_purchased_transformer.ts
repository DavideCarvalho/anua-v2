import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenItemPurchased from '#models/canteen_item_purchased'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'
import CanteenMealTransformer from '#transformers/canteen_meal_transformer'

export default class CanteenItemPurchasedTransformer extends BaseTransformer<CanteenItemPurchased> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenPurchaseId',
        'canteenItemId',
        'canteenMealId',
        'quantity',
        'unitPrice',
        'totalPrice',
        'createdAt',
        'updatedAt',
      ]),
      item: this.resource.canteenItemId
        ? CanteenItemTransformer.transform(this.whenLoaded(this.resource.item))
        : null,
      meal: this.resource.canteenMealId
        ? CanteenMealTransformer.transform(this.whenLoaded(this.resource.meal))
        : null,
    }
  }
}
