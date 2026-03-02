import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenMeal from '#models/canteen_meal'
import CanteenTransformer from '#transformers/canteen_transformer'

export default class CanteenMealTransformer extends BaseTransformer<CanteenMeal> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenId',
        'date',
        'mealType',
        'name',
        'description',
        'price',
        'maxServings',
        'availableServings',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      canteen: CanteenTransformer.transform(this.whenLoaded(this.resource.canteen)),
    }
  }
}
