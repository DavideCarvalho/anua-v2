import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenMealReservation from '#models/canteen_meal_reservation'
import CanteenMealTransformer from '#transformers/canteen_meal_transformer'
import StudentTransformer from '#transformers/student_transformer'

export default class CanteenMealReservationTransformer extends BaseTransformer<CanteenMealReservation> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'mealId',
        'studentId',
        'status',
        'reservedAt',
        'servedAt',
        'cancelledAt',
        'createdAt',
        'updatedAt',
      ]),
      meal: CanteenMealTransformer.transform(this.whenLoaded(this.resource.meal)),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
    }
  }
}
