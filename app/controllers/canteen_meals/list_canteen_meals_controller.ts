import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import { listCanteenMealsValidator } from '#validators/canteen'

export default class ListCanteenMealsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMealsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMeal.query().preload('canteen').orderBy('servedAt', 'asc')

    if (payload.canteenId) {
      query.where('canteenId', payload.canteenId)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    if (payload.servedAt) {
      const date = DateTime.fromJSDate(payload.servedAt)
      const start = date.startOf('day').toSQL()
      const end = date.endOf('day').toSQL()

      if (start && end) {
        query.whereBetween('servedAt', [start, end])
      }
    }

    const meals = await query.paginate(page, limit)

    return response.ok(meals)
  }
}
