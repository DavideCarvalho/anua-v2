import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import AttendanceDto from '#models/dto/attendance.dto'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { createAttendanceValidator } from '#validators/attendance'
import { gamificationEventService } from '#services/gamification/gamification_event_service'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class CreateAttendanceController {
  async handle({ request, response, logger }: HttpContext) {
    const data = await request.validateUsing(createAttendanceValidator)

    // Create the attendance record for this calendar slot/date
    // Validator provides classScheduleId, model expects calendarSlotId
    const attendance = await Attendance.create({
      calendarSlotId: data.classScheduleId,
      date: DateTime.now(),
    })

    // Create student attendance record
    const studentAttendance = await StudentHasAttendance.create({
      studentId: data.studentId,
      attendanceId: attendance.id,
      status: mapStatus(data.status),
      justification: data.justification || null,
    })

    await attendance.load('calendarSlot')

    // Trigger gamification event (creates event + dispatches job)
    const status = studentAttendance.status
    if (status === 'PRESENT' || status === 'LATE') {
      gamificationEventService
        .emitAttendanceMarked({
          attendanceId: attendance.id,
          studentId: data.studentId,
          status,
          date: attendance.date.toISO() || new Date().toISOString(),
        })
        .catch((err) => {
          logger.error({ err }, '[Gamification] Failed to emit attendance event')
        })
    }

    return response.created(new AttendanceDto(attendance))
  }
}
