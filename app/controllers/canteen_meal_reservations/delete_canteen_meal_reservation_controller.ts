import type { HttpContext } from '@adonisjs/core/http'
import CanteenMealReservation from '#models/canteen_meal_reservation'

export default class DeleteCanteenMealReservationController {
  async handle({ params, response }: HttpContext) {
    const reservation = await CanteenMealReservation.find(params.id)

    if (!reservation) {
      return response.notFound({ message: 'Reserva não encontrada' })
    }

    reservation.status = 'CANCELLED'
    reservation.consumedAt = null
    await reservation.save()

    await reservation.load('meal')
    await reservation.load('user')

    return response.ok(reservation)
  }
}
