import type { HttpContext } from '@adonisjs/core/http'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import Student from '#models/student'
import { createCanteenMealReservationValidator } from '#validators/canteen'

export default class CreateCanteenMealReservationController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMealReservationValidator)

    const student = await Student.find(payload.userId)
    if (!student) {
      return response.badRequest({ message: 'Reservas disponíveis apenas para alunos' })
    }

    const meal = await CanteenMeal.find(payload.canteenMealId)
    if (!meal) {
      return response.notFound({ message: 'Refeição não encontrada' })
    }

    if (!meal.isActive) {
      return response.badRequest({ message: 'Refeição inativa' })
    }

    if (meal.maxReservations) {
      const reservedTotals = await CanteenMealReservation.query()
        .where('canteenMealId', meal.id)
        .whereNot('status', 'CANCELLED')
        .sum('quantity as total')
        .first()

      const reservedQuantity = Number(reservedTotals?.$extras.total) || 0
      const requestedQuantity = payload.quantity ?? 1

      if (reservedQuantity + requestedQuantity > meal.maxReservations) {
        return response.badRequest({
          message: 'Limite de reservas excedido',
          available: meal.maxReservations - reservedQuantity,
        })
      }
    }

    const reservation = await CanteenMealReservation.create({
      canteenMealId: meal.id,
      userId: payload.userId,
      quantity: payload.quantity ?? 1,
      status: 'PENDING',
    })

    await reservation.load('meal')
    await reservation.load('user')

    return response.created(reservation)
  }
}
