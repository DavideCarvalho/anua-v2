import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreSettlement from '#models/store_settlement'
import StoreTransformer from '#transformers/store_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class StoreSettlementTransformer extends BaseTransformer<StoreSettlement> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'storeId',
        'month',
        'year',
        'totalSalesAmount',
        'commissionAmount',
        'platformFeeAmount',
        'transferAmount',
        'status',
        'approvedBy',
        'approvedAt',
        'processedAt',
        'pixTransactionId',
        'failureReason',
        'notes',
        'createdAt',
        'updatedAt',
      ]),
      store: StoreTransformer.transform(this.whenLoaded(this.resource.store)),
      approver: UserTransformer.transform(this.whenLoaded(this.resource.approver)),
    }
  }
}
