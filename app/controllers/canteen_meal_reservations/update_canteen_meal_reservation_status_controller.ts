import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import type { CanteenMealReservationStatus } from '#models/canteen_meal_reservation'
import { updateCanteenMealReservationStatusValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

// Map validator status to model status
function mapStatus(validatorStatus: string): CanteenMealReservationStatus {
  // Validator uses CONSUMED, model uses SERVED
  if (validatorStatus === 'CONSUMED') return 'SERVED'
  return validatorStatus as CanteenMealReservationStatus
}

export default class UpdateCanteenMealReservationStatusController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCanteenMealReservationStatusValidator)

    const reservation = await CanteenMealReservation.find(params.id)
    if (!reservation) {
      throw AppException.notFound('Reserva não encontrada')
    }

    const modelStatus = mapStatus(payload.status)
    reservation.status = modelStatus
    if (modelStatus === 'SERVED') {
      reservation.servedAt = DateTime.now()
    } else if (modelStatus === 'CANCELLED') {
      reservation.cancelledAt = DateTime.now()
    }

    await reservation.save()
    await reservation.load('meal')
    await reservation.load('student')

    return response.ok(reservation)
  }
}
