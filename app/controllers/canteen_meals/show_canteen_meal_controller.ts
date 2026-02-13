import type { HttpContext } from '@adonisjs/core/http'
import CanteenMeal from '#models/canteen_meal'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenMealController {
  async handle({ params, response }: HttpContext) {
    const meal = await CanteenMeal.query()
      .where('id', params.id)
      .preload('canteen')
      .preload('reservations')
      .first()

    if (!meal) {
      throw AppException.notFound('Refeição não encontrada')
    }

    return response.ok(meal)
  }
}
