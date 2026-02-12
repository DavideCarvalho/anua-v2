import type { HttpContext } from '@adonisjs/core/http'
import StudentHasExtraClassAttendance from '#models/student_has_extra_class_attendance'
import { updateExtraClassAttendanceValidator } from '#validators/extra_class'
import AppException from '#exceptions/app_exception'

export default class UpdateExtraClassAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(updateExtraClassAttendanceValidator)

    const studentAttendance = await StudentHasExtraClassAttendance.query()
      .whereHas('extraClassAttendance', (q) => {
        q.where('extraClassId', params.id)
      })
      .where('id', params.attendanceId)
      .first()

    if (!studentAttendance) {
      throw AppException.notFound('Registro de frequência não encontrado')
    }

    studentAttendance.status = data.status
    if (data.justification !== undefined) {
      studentAttendance.justification = data.justification ?? null
    }
    await studentAttendance.save()

    return response.ok(studentAttendance)
  }
}
