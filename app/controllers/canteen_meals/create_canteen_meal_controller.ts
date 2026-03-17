import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Canteen from '#models/canteen'
import CanteenMeal from '#models/canteen_meal'
import { createCanteenMealValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'
import CanteenMealTransformer from '#transformers/canteen_meal_transformer'

export default class CreateCanteenMealController {
  async handle({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createCanteenMealValidator)

    const canteen = await Canteen.find(payload.canteenId)
    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    const servedAt = DateTime.fromJSDate(payload.servedAt)
    const servedAtDate = servedAt.toISODate()

    if (!servedAtDate) {
      throw AppException.badRequest('Data da refeição inválida')
    }

    const mealType = payload.mealType ?? 'LUNCH'

    const existingMeal = await CanteenMeal.query()
      .where('canteenId', payload.canteenId)
      .where('date', servedAtDate)
      .where('mealType', mealType)
      .first()

    if (existingMeal) {
      existingMeal.merge({
        name: payload.name,
        description: payload.description ?? null,
        price: payload.price,
        date: servedAt,
        mealType,
        isActive: payload.isActive ?? true,
        maxServings: payload.maxReservations ?? null,
      })

      await existingMeal.save()
      await existingMeal.load('canteen')

      return response.ok(await serialize(CanteenMealTransformer.transform(existingMeal)))
    }

    const meal = await CanteenMeal.create({
      canteenId: payload.canteenId,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price,
      date: servedAt,
      mealType,
      isActive: payload.isActive ?? true,
      maxServings: payload.maxReservations ?? null,
    })

    await meal.load('canteen')

    return response.created(await serialize(CanteenMealTransformer.transform(meal)))
  }
}
