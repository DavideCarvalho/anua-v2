import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { batchCreateAttendanceValidator } from '#validators/attendance'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class BatchCreateAttendanceController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(batchCreateAttendanceValidator)

    // Create the attendance record for this calendar slot/date
    // Validator provides classScheduleId, model expects calendarSlotId
    const attendance = await Attendance.create({
      calendarSlotId: data.classScheduleId,
      date: DateTime.now(),
    })

    // Create student attendance records
    const studentAttendanceRecords = data.attendances.map((item) => ({
      studentId: item.studentId,
      attendanceId: attendance.id,
      status: mapStatus(item.status),
      justification: item.justification || null,
    }))

    const studentAttendances = await StudentHasAttendance.createMany(studentAttendanceRecords)

    return response.created({
      attendance,
      studentAttendances,
    })
  }
}
