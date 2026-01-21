import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { updateAttendanceValidator } from '#validators/attendance'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class UpdateAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    // This controller updates the student's attendance record
    const studentAttendance = await StudentHasAttendance.query()
      .where('id', params.id)
      .preload('attendance', (query) => {
        query.preload('calendarSlot')
      })
      .first()

    if (!studentAttendance) {
      return response.notFound({ message: 'Attendance record not found' })
    }

    const data = await request.validateUsing(updateAttendanceValidator)

    if (data.status !== undefined) {
      studentAttendance.status = mapStatus(data.status)
    }
    if (data.justification !== undefined) {
      studentAttendance.justification = data.justification
    }

    await studentAttendance.save()

    return response.ok(studentAttendance)
  }
}
