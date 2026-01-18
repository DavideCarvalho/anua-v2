import type { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import Teacher from '#models/teacher'
import { getTeacherAbsencesValidator } from '#validators/teacher_timesheet'

export default class GetTeacherAbsencesController {
  async handle({ request, response, auth }: HttpContext) {
    const { teacherId, month, year } = await request.validateUsing(getTeacherAbsencesValidator)

    const schoolId = auth.user?.schoolId
    if (!schoolId) {
      return response.ok([])
    }

    const teacher = await Teacher.query().where('id', teacherId).where('schoolId', schoolId).first()
    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    // Minimal: return absences linked to teacher's userId within month/year.
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${year}-${String(month).padStart(2, '0')}-31`

    const absences = await Absence.query()
      .where('userId', teacher.id)
      .whereBetween('date', [start, end])
      .orderBy('date', 'desc')

    return response.ok(absences)
  }
}
