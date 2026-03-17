import type { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import Teacher from '#models/teacher'
import UserHasSchool from '#models/user_has_school'
import { getTeacherAbsencesValidator } from '#validators/teacher_timesheet'
import AppException from '#exceptions/app_exception'
import AbsenceTransformer from '#transformers/absence_transformer'

export default class GetTeacherAbsencesController {
  async handle({ request, response, auth, serialize, effectiveUser }: HttpContext) {
    const { teacherId, month, year } = await request.validateUsing(getTeacherAbsencesValidator)

    const user = effectiveUser ?? auth.user!
    const userSchools = await UserHasSchool.query().where('userId', user.id).select('schoolId')
    const schoolIds = userSchools.map((item) => item.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return response.ok([])
    }

    const teacher = await Teacher.query()
      .where('id', teacherId)
      .whereHas('user', (userQuery) => {
        userQuery.whereIn('schoolId', schoolIds)
      })
      .first()
    if (!teacher) {
      throw AppException.notFound('Professor não encontrado')
    }

    // Minimal: return absences linked to teacher's userId within month/year.
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${year}-${String(month).padStart(2, '0')}-31`

    const absences = await Absence.query()
      .where('userId', teacher.id)
      .whereBetween('date', [start, end])
      .orderBy('date', 'desc')

    return response.ok(await serialize(AbsenceTransformer.transform(absences)))
  }
}
