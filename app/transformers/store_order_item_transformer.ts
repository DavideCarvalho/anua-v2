import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreOrderItem from '#models/store_order_item'
import StoreItemTransformer from '#transformers/store_item_transformer'
import StoreOrderTransformer from '#transformers/store_order_transformer'

export default class StoreOrderItemTransformer extends BaseTransformer<StoreOrderItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'orderId',
        'storeItemId',
        'quantity',
        'unitPrice',
        'paymentMode',
        'pointsToMoneyRate',
        'pointsPaid',
        'moneyPaid',
        'itemName',
        'itemDescription',
        'itemImageUrl',
        'createdAt',
      ]),
      storeItem: StoreItemTransformer.transform(this.whenLoaded(this.resource.storeItem)),
      storeOrder: StoreOrderTransformer.transform(this.whenLoaded(this.resource.storeOrder)),
    }
  }
}
