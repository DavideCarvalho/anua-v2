import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import UserHasSchool from '#models/user_has_school'
import { getTeachersTimesheetValidator } from '#validators/teacher_timesheet'
import TeacherTimesheetRowTransformer from '#transformers/teacher_timesheet_row_transformer'

/**
 * Minimal implementation to support the Folha de Ponto UI.
 *
 * Returns basic aggregated rows per teacher. We can refine salary/benefits later.
 */
export default class GetTeachersTimesheetController {
  async handle({ request, response, auth, serialize, effectiveUser }: HttpContext) {
    const { month, year } = await request.validateUsing(getTeachersTimesheetValidator)

    const user = effectiveUser ?? auth.user!
    const userSchools = await UserHasSchool.query().where('userId', user.id).select('schoolId')
    const schoolIds = userSchools.map((item) => item.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return response.ok([])
    }

    const teachers = await Teacher.query()
      .preload('user')
      .whereHas('user', (userQuery) => {
        userQuery.whereIn('schoolId', schoolIds)
      })
      .orderBy('id', 'desc')

    const rows = teachers.map((teacher) => ({
      id: teacher.id,
      user: {
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

    return response.ok(await serialize(TeacherTimesheetRowTransformer.transform(rows)))
  }
}
