import type { HttpContext } from '@adonisjs/core/http'
import CanteenMealReservation from '#models/canteen_meal_reservation'

export default class ShowCanteenMealReservationController {
  async handle({ params, response }: HttpContext) {
    const reservation = await CanteenMealReservation.query()
      .where('id', params.id)
      .preload('meal', (mealQuery) => mealQuery.preload('canteen'))
      .preload('student')
      .first()

    if (!reservation) {
      return response.notFound({ message: 'Reserva nao encontrada' })
    }

    return response.ok(reservation)
  }
}
