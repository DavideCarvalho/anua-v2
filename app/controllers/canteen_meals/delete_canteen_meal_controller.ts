import type { HttpContext } from '@adonisjs/core/http'
import CanteenMeal from '#models/canteen_meal'
import AppException from '#exceptions/app_exception'

export default class DeleteCanteenMealController {
  async handle({ params, response }: HttpContext) {
    const meal = await CanteenMeal.find(params.id)

    if (!meal) {
      throw AppException.notFound('Refeição não encontrada')
    }

    await meal.delete()

    return response.noContent()
  }
}
