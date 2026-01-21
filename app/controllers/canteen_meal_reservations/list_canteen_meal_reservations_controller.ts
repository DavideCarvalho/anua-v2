import type { HttpContext } from '@adonisjs/core/http'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import { listCanteenMealReservationsValidator } from '#validators/canteen'

export default class ListCanteenMealReservationsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMealReservationsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMealReservation.query()
      .preload('meal', (mealQuery) => mealQuery.preload('canteen'))
      .preload('student')
      .orderBy('createdAt', 'desc')

    // Validator provides canteenMealId, model expects mealId
    if (payload.canteenMealId) {
      query.where('mealId', payload.canteenMealId)
    }

    // Validator provides userId, model expects studentId
    if (payload.userId) {
      query.where('studentId', payload.userId)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    const reservations = await query.paginate(page, limit)

    return response.ok(reservations)
  }
}
