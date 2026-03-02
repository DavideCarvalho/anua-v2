import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealTransformer from '#transformers/canteen_meal_transformer'
import { listCanteenMealsValidator } from '#validators/canteen'

export default class ListCanteenMealsController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMealsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMeal.query().preload('canteen').orderBy('date', 'asc')

    if (payload.canteenId) {
      query.where('canteenId', payload.canteenId)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    if (payload.servedAt) {
      const date = DateTime.fromJSDate(payload.servedAt).toISODate()
      if (date) {
        query.where('date', date)
      }
    }

    const meals = await query.paginate(page, limit)

    const data = meals.all()
    const metadata = meals.getMeta()

    return serialize(CanteenMealTransformer.paginate(data, metadata))
  }
}
