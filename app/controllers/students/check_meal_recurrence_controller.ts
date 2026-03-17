import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import Canteen from '#models/canteen'
import StudentMealRecurrence from '#models/student_meal_recurrence'
import { checkMealRecurrenceValidator } from '#validators/student_meal_recurrence'
import AppException from '#exceptions/app_exception'

/**
 * Check if a student has meal recurrence configured for a given date and meal type.
 * Used by PDV before finalizing a sale to warn about possible duplication.
 */
export default class CheckMealRecurrenceController {
  async handle({ params, request }: HttpContext) {
    const { studentId } = params
    const { date, mealType } = await request.validateUsing(checkMealRecurrenceValidator)

    const student = await Student.query().where('id', studentId).preload('class').first()

    if (!student || !student.class) {
      return { hasRecurrence: false }
    }

    const schoolId = student.class.schoolId
    const canteen = await Canteen.query().where('schoolId', schoolId).first()

    if (!canteen) {
      return { hasRecurrence: false }
    }

    const dt = DateTime.fromISO(date)
    if (!dt.isValid) {
      throw AppException.badRequest('Data inválida')
    }

    const weekDay = dt.weekday // 1=Monday ... 7=Sunday in Luxon; plan uses 1=Segunda ... 5=Sexta
    if (weekDay === 6 || weekDay === 7) {
      return { hasRecurrence: false }
    }

    const recurrence = await StudentMealRecurrence.query()
      .where('studentId', studentId)
      .where('canteenId', canteen.id)
      .where('weekDay', weekDay)
      .where('mealType', mealType)
      .first()

    if (!recurrence) {
      return { hasRecurrence: false }
    }

    const mealLabel = mealType === 'LUNCH' ? 'almoço' : 'janta'
    const dayLabel = dt.setLocale('pt-BR').toLocaleString({ weekday: 'long' })
    return {
      hasRecurrence: true,
      message: `Este aluno já tem recorrência de ${mealLabel} configurada para ${dayLabel}. A venda pode resultar em duplicidade.`,
    }
  }
}
