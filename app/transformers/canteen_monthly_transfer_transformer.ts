import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import CanteenTransformer from '#transformers/canteen_transformer'
import CanteenPurchaseTransformer from '#transformers/canteen_purchase_transformer'

export default class CanteenMonthlyTransferTransformer extends BaseTransformer<CanteenMonthlyTransfer> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenId',
        'month',
        'year',
        'totalAmount',
        'status',
        'processedAt',
        'createdAt',
        'updatedAt',
      ]),
      canteen: CanteenTransformer.transform(this.whenLoaded(this.resource.canteen)),
      purchases: CanteenPurchaseTransformer.transform(this.whenLoaded(this.resource.purchases)),
    }
  }
}
