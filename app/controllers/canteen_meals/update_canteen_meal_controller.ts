import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenMeal from '#models/canteen_meal'
import { updateCanteenMealValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class UpdateCanteenMealController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCanteenMealValidator)

    const meal = await CanteenMeal.find(params.id)
    if (!meal) {
      throw AppException.notFound('Refeição não encontrada')
    }

    meal.merge({
      name: payload.name ?? meal.name,
      description: payload.description ?? meal.description,
      price: payload.price ?? meal.price,
      // Validator provides servedAt, model expects date
      date: payload.servedAt ? DateTime.fromJSDate(payload.servedAt) : meal.date,
      isActive: payload.isActive ?? meal.isActive,
      // Validator provides maxReservations, model expects maxServings
      maxServings: payload.maxReservations ?? meal.maxServings,
    })

    await meal.save()
    await meal.load('canteen')

    return response.ok(meal)
  }
}
