import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import { updateCanteenMealReservationStatusValidator } from '#validators/canteen'

export default class UpdateCanteenMealReservationStatusController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCanteenMealReservationStatusValidator)

    const reservation = await CanteenMealReservation.find(params.id)
    if (!reservation) {
      return response.notFound({ message: 'Reserva não encontrada' })
    }

    reservation.status = payload.status
    reservation.consumedAt = payload.status === 'CONSUMED' ? DateTime.now() : null

    await reservation.save()
    await reservation.load('meal')
    await reservation.load('user')

    return response.ok(reservation)
  }
}
