import type { HttpContext } from '@adonisjs/core/http'
import CanteenMeal from '#models/canteen_meal'

export default class DeleteCanteenMealController {
  async handle({ params, response }: HttpContext) {
    const meal = await CanteenMeal.find(params.id)

    if (!meal) {
      return response.notFound({ message: 'Refeição não encontrada' })
    }

    await meal.delete()

    return response.noContent()
  }
}
