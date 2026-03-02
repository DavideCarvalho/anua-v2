import { BaseTransformer } from '@adonisjs/core/transformers'
import type Store from '#models/store'
import SchoolTransformer from '#transformers/school_transformer'
import UserTransformer from '#transformers/user_transformer'
import StoreItemTransformer from '#transformers/store_item_transformer'

export default class StoreTransformer extends BaseTransformer<Store> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'ownerUserId',
        'name',
        'description',
        'type',
        'commissionPercentage',
        'isActive',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      owner: UserTransformer.transform(this.whenLoaded(this.resource.owner)),
      items: StoreItemTransformer.transform(this.whenLoaded(this.resource.items)),
    }
  }
}
