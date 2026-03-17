import type { HttpContext } from '@adonisjs/core/http'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import AppException from '#exceptions/app_exception'
import CanteenMealReservationTransformer from '#transformers/canteen_meal_reservation_transformer'

export default class ShowCanteenMealReservationController {
  async handle({ params, response, serialize }: HttpContext) {
    const reservation = await CanteenMealReservation.query()
      .where('id', params.id)
      .preload('meal', (mealQuery) => mealQuery.preload('canteen'))
      .preload('student')
      .first()

    if (!reservation) {
      throw AppException.notFound('Reserva não encontrada')
    }

    return response.ok(await serialize(CanteenMealReservationTransformer.transform(reservation)))
  }
}
