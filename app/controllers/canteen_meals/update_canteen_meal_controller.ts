import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import { updateCanteenMealValidator } from '#validators/canteen'

export default class UpdateCanteenMealController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCanteenMealValidator)

    const meal = await CanteenMeal.find(params.id)
    if (!meal) {
      return response.notFound({ message: 'Refeição não encontrada' })
    }

    meal.merge({
      name: payload.name ?? meal.name,
      description: payload.description ?? meal.description,
      price: payload.price ?? meal.price,
      servedAt: payload.servedAt ? DateTime.fromJSDate(payload.servedAt) : meal.servedAt,
      isActive: payload.isActive ?? meal.isActive,
      maxReservations: payload.maxReservations ?? meal.maxReservations,
    })

    await meal.save()
    await meal.load('canteen')

    return response.ok(meal)
  }
}
