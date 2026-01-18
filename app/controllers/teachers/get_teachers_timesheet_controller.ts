import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { getTeachersTimesheetValidator } from '#validators/teacher_timesheet'

/**
 * Minimal implementation to support the Folha de Ponto UI.
 *
 * Returns basic aggregated rows per teacher. We can refine salary/benefits later.
 */
export default class GetTeachersTimesheetController {
  async handle({ request, response, auth }: HttpContext) {
    const { month, year } = await request.validateUsing(getTeachersTimesheetValidator)

    const schoolId = auth.user?.schoolId
    if (!schoolId) {
      return response.ok([])
    }

    const teachers = await Teacher.query()
      .preload('user')
      .where('schoolId', schoolId)
      .orderBy('createdAt', 'desc')

    const rows = teachers.map((teacher) => ({
      id: teacher.id,
      User: {
        name: teacher.user?.name,
      },
      totalClasses: 0,
      totalAbsences: 0,
      excusedAbsences: 0,
      unexcusedAbsences: 0,
      approvedUnexcusedAbsences: 0,
      classValue: 0,
      baseSalary: 0,
      benefits: {
        total: 0,
        deductions: 0,
      },
      finalSalary: 0,
      month,
      year,
    }))

    return response.ok(rows)
  }
}
