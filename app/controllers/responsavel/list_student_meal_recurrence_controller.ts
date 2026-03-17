import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import Student from '#models/student'
import Canteen from '#models/canteen'
import StudentMealRecurrence from '#models/student_meal_recurrence'
import AppException from '#exceptions/app_exception'

export default class ListStudentMealRecurrenceController {
  async handle({ params, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as recorrências deste aluno')
    }

    const student = await Student.query().where('id', studentId).preload('class').first()

    if (!student || !student.class) {
      return { data: [], canteenId: null }
    }

    const schoolId = student.class.schoolId
    const canteen = await Canteen.query()
      .where('schoolId', schoolId)
      .orderBy('createdAt', 'desc')
      .first()

    if (!canteen) {
      return { data: [], canteenId: null }
    }

    const recurrences = await StudentMealRecurrence.query()
      .where('studentId', studentId)
      .where('canteenId', canteen.id)
      .preload('canteenMeal')
      .orderBy('weekDay')
      .orderBy('mealType')

    return {
      data: recurrences.map((r) => ({
        id: r.id,
        weekDay: r.weekDay,
        mealType: r.mealType,
        canteenMealId: r.canteenMealId,
        canteenMeal: r.canteenMeal
          ? { id: r.canteenMeal.id, name: r.canteenMeal.name, mealType: r.canteenMeal.mealType }
          : null,
      })),
      canteenId: canteen.id,
    }
  }
}
