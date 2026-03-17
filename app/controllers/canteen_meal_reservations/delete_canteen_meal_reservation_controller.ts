import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import AppException from '#exceptions/app_exception'
import CanteenMealReservationTransformer from '#transformers/canteen_meal_reservation_transformer'

export default class DeleteCanteenMealReservationController {
  async handle({ params, response, serialize }: HttpContext) {
    const reservation = await CanteenMealReservation.find(params.id)

    if (!reservation) {
      throw AppException.notFound('Reserva não encontrada')
    }

    reservation.status = 'CANCELLED'
    reservation.cancelledAt = DateTime.now()
    await reservation.save()

    await reservation.load('meal', (mealQuery) => mealQuery.preload('canteen'))
    await reservation.load('student')

    return response.ok(await serialize(CanteenMealReservationTransformer.transform(reservation)))
  }
}
