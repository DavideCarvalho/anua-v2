import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreItem from '#models/store_item'
import SchoolTransformer from '#transformers/school_transformer'
import StoreTransformer from '#transformers/store_transformer'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'

export default class StoreItemTransformer extends BaseTransformer<StoreItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'storeId',
        'canteenItemId',
        'name',
        'description',
        'price',
        'paymentMode',
        'pointsToMoneyRate',
        'minPointsPercentage',
        'maxPointsPercentage',
        'category',
        'imageUrl',
        'totalStock',
        'maxPerStudent',
        'maxPerStudentPeriod',
        'preparationTimeMinutes',
        'requiresApproval',
        'pickupLocation',
        'availableFrom',
        'availableUntil',
        'isActive',
        'metadata',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      store: StoreTransformer.transform(this.whenLoaded(this.resource.store)),
      canteenItem: CanteenItemTransformer.transform(this.whenLoaded(this.resource.canteenItem)),
    }
  }
}
