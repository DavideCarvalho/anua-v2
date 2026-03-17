import type { HttpContext } from '@adonisjs/core/http'
import CreateMealRecurrenceReservations from '#start/jobs/create_meal_recurrence_reservations'

/**
 * Gera reservas de recorrência para uma data.
 * Usado na tela de reservas quando o usuário clica em "Gerar reservas de recorrência".
 * Usa selectedSchoolIds do middleware para filtrar cantinas.
 */
export default class GenerateRecurrenceReservationsController {
  async handle({ selectedSchoolIds, request }: HttpContext) {
    const date = request.input('date') as string | undefined
    const schoolIds = selectedSchoolIds ?? []

    const result = await CreateMealRecurrenceReservations.handle(
      date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
      schoolIds
    )

    return {
      created: result.created,
      skippedExisting: result.skippedExisting,
      skippedNoMeal: result.skippedNoMeal,
    }
  }
}
