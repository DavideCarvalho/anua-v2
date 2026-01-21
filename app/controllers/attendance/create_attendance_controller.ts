import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { createAttendanceValidator } from '#validators/attendance'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class CreateAttendanceController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createAttendanceValidator)

    // Create the attendance record for this calendar slot/date
    // Validator provides classScheduleId, model expects calendarSlotId
    const attendance = await Attendance.create({
      calendarSlotId: data.classScheduleId,
      date: DateTime.now(),
    })

    // Create student attendance record
    await StudentHasAttendance.create({
      studentId: data.studentId,
      attendanceId: attendance.id,
      status: mapStatus(data.status),
      justification: data.justification || null,
    })

    await attendance.load('calendarSlot')

    return response.created(attendance)
  }
}
