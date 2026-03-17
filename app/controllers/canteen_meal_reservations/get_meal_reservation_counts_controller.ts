import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getMealReservationCountsValidator } from '#validators/canteen'

/**
 * Retorna contagem de reservas por tipo (almoço/janta) para uma data.
 * Usado no cardápio para exibir quantas pessoas reservaram.
 */
export default class GetMealReservationCountsController {
  async handle({ request }: HttpContext) {
    const { canteenId, date } = await request.validateUsing(getMealReservationCountsValidator)

    const dateIso = String(date)
    if (!dateIso) {
      return { lunch: 0, dinner: 0 }
    }

    const result = await db
      .from('CanteenMealReservation')
      .join('CanteenMeal', 'CanteenMealReservation.mealId', 'CanteenMeal.id')
      .where('CanteenMeal.canteenId', canteenId)
      .where('CanteenMeal.date', dateIso)
      .whereNot('CanteenMealReservation.status', 'CANCELLED')
      .select('CanteenMeal.mealType')
      .count('* as total')
      .groupBy('CanteenMeal.mealType')

    const counts = { lunch: 0, dinner: 0 }
    for (const row of result) {
      const total = Number((row as { total: string }).total) || 0
      const mealType = (row as { mealType: string }).mealType
      if (mealType === 'LUNCH') counts.lunch = total
      if (mealType === 'DINNER') counts.dinner = total
    }

    return counts
  }
}
