import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import AppException from '#exceptions/app_exception'

export default class DeleteCanteenMealReservationController {
  async handle({ params, response }: HttpContext) {
    const reservation = await CanteenMealReservation.find(params.id)

    if (!reservation) {
      throw AppException.notFound('Reserva não encontrada')
    }

    reservation.status = 'CANCELLED'
    reservation.cancelledAt = DateTime.now()
    await reservation.save()

    await reservation.load('meal')
    await reservation.load('student')

    return response.ok(reservation)
  }
}
