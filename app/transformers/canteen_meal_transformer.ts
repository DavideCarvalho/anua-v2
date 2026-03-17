import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenMeal from '#models/canteen_meal'
import CanteenTransformer from '#transformers/canteen_transformer'
import CanteenMealReservationTransformer from '#transformers/canteen_meal_reservation_transformer'

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
      reservations: CanteenMealReservationTransformer.transform(
        this.whenLoaded(this.resource.reservations)
      ),
    }
  }
}
