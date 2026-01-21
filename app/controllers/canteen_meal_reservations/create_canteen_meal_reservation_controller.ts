import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import Student from '#models/student'
import { createCanteenMealReservationValidator } from '#validators/canteen'

export default class CreateCanteenMealReservationController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMealReservationValidator)

    // Validator provides userId, model expects studentId
    const student = await Student.find(payload.userId)
    if (!student) {
      return response.badRequest({ message: 'Reservas disponiveis apenas para alunos' })
    }

    // Validator provides canteenMealId, model expects mealId
    const meal = await CanteenMeal.find(payload.canteenMealId)
    if (!meal) {
      return response.notFound({ message: 'Refeicao nao encontrada' })
    }

    if (!meal.isActive) {
      return response.badRequest({ message: 'Refeicao inativa' })
    }

    if (meal.maxServings) {
      const reservedCount = await CanteenMealReservation.query()
        .where('mealId', meal.id)
        .whereNot('status', 'CANCELLED')
        .count('* as total')
        .first()

      const reservedQuantity = Number(reservedCount?.$extras.total) || 0

      if (reservedQuantity >= meal.maxServings) {
        return response.badRequest({
          message: 'Limite de reservas excedido',
          available: meal.maxServings - reservedQuantity,
        })
      }
    }

    const reservation = await CanteenMealReservation.create({
      mealId: meal.id,
      studentId: payload.userId, // Map userId to studentId
      status: 'PENDING',
      reservedAt: DateTime.now(),
    })

    await reservation.load('meal')
    await reservation.load('student')

    return response.created(reservation)
  }
}
