import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Canteen from '#models/canteen'
import CanteenMeal from '#models/canteen_meal'
import { createCanteenMealValidator } from '#validators/canteen'

export default class CreateCanteenMealController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMealValidator)

    const canteen = await Canteen.find(payload.canteenId)
    if (!canteen) {
      return response.notFound({ message: 'Cantina não encontrada' })
    }

    const meal = await CanteenMeal.create({
      canteenId: payload.canteenId,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price,
      servedAt: DateTime.fromJSDate(payload.servedAt),
      isActive: payload.isActive ?? true,
      maxReservations: payload.maxReservations ?? null,
    })

    await meal.load('canteen')

    return response.created(meal)
  }
}
