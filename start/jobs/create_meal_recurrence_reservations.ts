import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import Canteen from '#models/canteen'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import StudentMealRecurrence from '#models/student_meal_recurrence'

/**
 * Cria CanteenMealReservation a partir de StudentMealRecurrence para o dia atual.
 * Roda diariamente (ex: 05:30) para gerar as reservas do dia.
 *
 * Para cada canteen:
 * - Busca CanteenMeals de hoje (LUNCH, DINNER)
 * - Para cada StudentMealRecurrence que bate com o dia da semana e mealType
 * - Se já existe reserva para esse aluno+meal, pula
 * - Cria CanteenMealReservation com source RECURRENCE
 *
 * @param forDate - Data no formato YYYY-MM-DD (opcional, default hoje)
 * @param schoolIds - IDs das escolas para filtrar cantinas (opcional, default todas)
 */
export default class CreateMealRecurrenceReservations {
  static async handle(forDate?: string, schoolIds?: string[]) {
    const targetDate = forDate
      ? DateTime.fromISO(forDate).startOf('day')
      : DateTime.now().startOf('day')
    const dateIso = targetDate.toISODate()
    const weekDay = targetDate.weekday // 1=Monday ... 5=Friday

    if (weekDay === 6 || weekDay === 7) {
      logger.info('[MEAL_RECURRENCE] Skipping weekend')
      return { created: 0, skipped: 0 }
    }

    let canteensQuery = Canteen.query()
    if (schoolIds && schoolIds.length > 0) {
      canteensQuery = canteensQuery.whereIn('schoolId', schoolIds)
    }
    const canteens = await canteensQuery
    let totalCreated = 0
    let skippedExisting = 0
    let skippedNoMeal = 0

    for (const canteen of canteens) {
      const targetMeals = await CanteenMeal.query()
        .where('canteenId', canteen.id)
        .where('date', dateIso!)
        .whereIn('mealType', ['LUNCH', 'DINNER'])
        .where('isActive', true)

      const mealByType = new Map<string, CanteenMeal>()
      for (const m of targetMeals) {
        mealByType.set(m.mealType, m)
      }

      const recurrences = await StudentMealRecurrence.query()
        .where('canteenId', canteen.id)
        .where('weekDay', weekDay)
        .whereIn('mealType', ['LUNCH', 'DINNER'])

      for (const rec of recurrences) {
        const meal = mealByType.get(rec.mealType)
        if (!meal) {
          logger.debug(
            `[MEAL_RECURRENCE] No meal for ${rec.mealType} on ${dateIso} in canteen ${canteen.id}`
          )
          skippedNoMeal++
          continue
        }

        const existing = await CanteenMealReservation.query()
          .where('mealId', meal.id)
          .where('studentId', rec.studentId)
          .whereNot('status', 'CANCELLED')
          .first()

        if (existing) {
          skippedExisting++
          continue
        }

        await CanteenMealReservation.create({
          mealId: meal.id,
          studentId: rec.studentId,
          status: 'RESERVED',
          reservedAt: targetDate,
          source: 'RECURRENCE',
        })
        totalCreated++
      }
    }

    logger.info('[MEAL_RECURRENCE] Created reservations', {
      created: totalCreated,
      skippedExisting,
      skippedNoMeal,
      date: dateIso,
    })
    return { created: totalCreated, skippedExisting, skippedNoMeal }
  }
}
