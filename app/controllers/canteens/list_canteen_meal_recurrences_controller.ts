import type { HttpContext } from '@adonisjs/core/http'
import StudentMealRecurrence from '#models/student_meal_recurrence'

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  LUNCH: 'Almoço',
  DINNER: 'Janta',
}

/**
 * Lista recorrências configuradas para uma cantina.
 * Usado na tela /escola/cantina/recorrencias.
 */
export default class ListCanteenMealRecurrencesController {
  async handle({ params }: HttpContext) {
    const canteenId = params.canteenId

    const recurrences = await StudentMealRecurrence.query()
      .where('canteenId', canteenId)
      .preload('student', (q) => q.preload('user'))
      .preload('canteenMeal')
      .orderBy('studentId')
      .orderBy('weekDay')
      .orderBy('mealType')

    const byStudent = new Map<
      string,
      {
        studentId: string
        studentName: string
        slots: Array<{ weekDay: number; weekDayLabel: string; mealType: string; mealTypeLabel: string; canteenMealName: string | null }>
      }
    >()

    for (const r of recurrences) {
      const key = r.studentId
      if (!byStudent.has(key)) {
        byStudent.set(key, {
          studentId: r.studentId,
          studentName: r.student?.user?.name ?? 'Aluno',
          slots: [],
        })
      }
      const entry = byStudent.get(key)!
      entry.slots.push({
        weekDay: r.weekDay,
        weekDayLabel: WEEKDAY_LABELS[r.weekDay] ?? '',
        mealType: r.mealType,
        mealTypeLabel: MEAL_TYPE_LABELS[r.mealType] ?? r.mealType,
        canteenMealName: r.canteenMeal?.name ?? null,
      })
    }

    return {
      data: [...byStudent.values()],
      total: recurrences.length,
    }
  }
}
