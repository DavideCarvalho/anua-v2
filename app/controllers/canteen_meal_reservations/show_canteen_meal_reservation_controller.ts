import type { HttpContext } from '@adonisjs/core/http'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import CanteenMealReservationDto from '#models/dto/canteen_meal_reservation.dto'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenMealReservationController {
  async handle({ params, response }: HttpContext) {
    const reservation = await CanteenMealReservation.query()
      .where('id', params.id)
      .preload('meal', (mealQuery) => mealQuery.preload('canteen'))
      .preload('student')
      .first()

    if (!reservation) {
      throw AppException.notFound('Reserva não encontrada')
    }

    return response.ok(new CanteenMealReservationDto(reservation))
  }
}
