import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { updateAttendanceValidator } from '#validators/attendance'
import AppException from '#exceptions/app_exception'
import StudentHasAttendanceTransformer from '#transformers/student_has_attendance_transformer'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class UpdateAttendanceController {
  async handle({ params, request, response, serialize }: HttpContext) {
    // This controller updates the student's attendance record
    const studentAttendance = await StudentHasAttendance.query()
      .where('id', params.id)
      .preload('attendance', (query) => {
        query.preload('calendarSlot')
      })
      .first()

    if (!studentAttendance) {
      throw AppException.notFound('Registro de presença não encontrado')
    }

    const data = await request.validateUsing(updateAttendanceValidator)

    if (data.status !== undefined) {
      studentAttendance.status = mapStatus(data.status)
    }
    if (data.justification !== undefined) {
      studentAttendance.justification = data.justification
    }

    await studentAttendance.save()

    return response.ok(
      await serialize(StudentHasAttendanceTransformer.transform(studentAttendance))
    )
  }
}
