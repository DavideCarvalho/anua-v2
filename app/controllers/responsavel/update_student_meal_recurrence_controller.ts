import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import Student from '#models/student'
import Canteen from '#models/canteen'
import CanteenMeal from '#models/canteen_meal'
import StudentMealRecurrence from '#models/student_meal_recurrence'
import { updateStudentMealRecurrenceValidator } from '#validators/student_meal_recurrence'
import AppException from '#exceptions/app_exception'

export default class UpdateStudentMealRecurrenceController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const payload = await request.validateUsing(updateStudentMealRecurrenceValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para configurar as recorrências deste aluno')
    }

    const student = await Student.query()
      .where('id', studentId)
      .preload('class')
      .first()

    if (!student || !student.class) {
      throw AppException.badRequest('Aluno não possui turma vinculada')
    }

    const schoolId = student.class.schoolId
    const canteen = await Canteen.query()
      .where('schoolId', schoolId)
      .orderBy('createdAt', 'desc')
      .first()

    if (!canteen) {
      throw AppException.badRequest('Escola do aluno não possui cantina')
    }

      for (const slot of payload.slots) {
      const canteenMealId = slot.canteenMealId ?? null
      if (canteenMealId) {
        const meal = await CanteenMeal.query()
          .where('id', canteenMealId)
          .where('canteenId', canteen.id)
          .first()

        if (!meal) {
          throw AppException.badRequest(
            `Refeição ${canteenMealId} não existe ou não pertence à cantina da escola`
          )
        }
        if (meal.mealType !== slot.mealType) {
          throw AppException.badRequest(
            `Refeição selecionada não é do tipo ${slot.mealType}`
          )
        }
      }
    }

    await db.transaction(async (trx) => {
      await StudentMealRecurrence.query()
        .where('studentId', studentId)
        .where('canteenId', canteen.id)
        .useTransaction(trx)
        .delete()

      const uniqueSlots = new Map<string, { weekDay: number; mealType: string; canteenMealId: string | null }>()
      for (const slot of payload.slots) {
        const key = `${slot.weekDay}-${slot.mealType}`
        if (!uniqueSlots.has(key)) {
          uniqueSlots.set(key, {
            weekDay: slot.weekDay,
            mealType: slot.mealType,
            canteenMealId: slot.canteenMealId ?? null,
          })
        }
      }

      for (const slot of uniqueSlots.values()) {
        const rec = new StudentMealRecurrence()
        rec.useTransaction(trx)
        rec.studentId = studentId
        rec.canteenId = canteen.id
        rec.weekDay = slot.weekDay
        rec.mealType = slot.mealType as 'LUNCH' | 'DINNER'
        rec.canteenMealId = slot.canteenMealId
        await rec.save()
      }
    })

    return { success: true }
  }
}
