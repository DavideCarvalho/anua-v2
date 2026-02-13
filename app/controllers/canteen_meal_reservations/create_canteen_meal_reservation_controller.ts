import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import Student from '#models/student'
import { createCanteenMealReservationValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenMealReservationController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMealReservationValidator)

    // Validator provides userId, model expects studentId
    const student = await Student.find(payload.userId)
    if (!student) {
      throw AppException.badRequest('Reservas disponíveis apenas para alunos')
    }

    // Validator provides canteenMealId, model expects mealId
    const meal = await CanteenMeal.find(payload.canteenMealId)
    if (!meal) {
      throw AppException.notFound('Refeição não encontrada')
    }

    if (!meal.isActive) {
      throw AppException.badRequest('Refeição inativa')
    }

    if (meal.maxServings) {
      const reservedCount = await CanteenMealReservation.query()
        .where('mealId', meal.id)
        .whereNot('status', 'CANCELLED')
        .count('* as total')
        .first()

      const reservedQuantity = Number(reservedCount?.$extras.total) || 0

      if (reservedQuantity >= meal.maxServings) {
        throw AppException.badRequest('Limite de reservas excedido')
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
