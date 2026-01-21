import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMealReservation from '#models/canteen_meal_reservation'

export default class DeleteCanteenMealReservationController {
  async handle({ params, response }: HttpContext) {
    const reservation = await CanteenMealReservation.find(params.id)

    if (!reservation) {
      return response.notFound({ message: 'Reserva nao encontrada' })
    }

    reservation.status = 'CANCELLED'
    reservation.cancelledAt = DateTime.now()
    await reservation.save()

    await reservation.load('meal')
    await reservation.load('student')

    return response.ok(reservation)
  }
}
