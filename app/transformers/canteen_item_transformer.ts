import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenItem from '#models/canteen_item'
import CanteenTransformer from '#transformers/canteen_transformer'

export default class CanteenItemTransformer extends BaseTransformer<CanteenItem> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenId',
        'name',
        'description',
        'price',
        'category',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      image: this.resource.image ?? null,
      imageUrl: this.resource.image?.url ?? null,
      canteen: CanteenTransformer.transform(this.whenLoaded(this.resource.canteen)),
    }
  }
}
