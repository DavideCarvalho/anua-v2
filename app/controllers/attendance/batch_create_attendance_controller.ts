import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { batchCreateAttendanceValidator } from '#validators/attendance'
import AppException from '#exceptions/app_exception'

// Map validator status to model status
function mapStatus(validatorStatus: string): AttendanceStatus {
  if (validatorStatus === 'JUSTIFIED') return 'EXCUSED'
  return validatorStatus as AttendanceStatus
}

export default class BatchCreateAttendanceController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(batchCreateAttendanceValidator)

    const calendar = await Calendar.query()
      .where('classId', data.classId)
      .where('academicPeriodId', data.academicPeriodId)
      .where('isActive', true)
      .where('isCanceled', false)
      .first()

    if (!calendar) {
      throw AppException.badRequest('Nenhum calendário ativo encontrado para esta turma e período.')
    }

    // Load all slots for this subject once
    const allSlots = await CalendarSlot.query()
      .where('calendarId', calendar.id)
      .where('isBreak', false)
      .whereNotNull('teacherHasClassId')
      .whereHas('teacherHasClass', (q) => q.where('subjectId', data.subjectId))

    if (allSlots.length === 0) {
      const hasAnySlots = await CalendarSlot.query()
        .where('calendarId', calendar.id)
        .where('isBreak', false)
        .whereNotNull('teacherHasClassId')
        .limit(1)
        .first()

      if (!hasAnySlots) {
        throw AppException.badRequest(
          'Nenhum horário configurado para esta turma neste período. Configure a grade de horários antes de registrar presenças.'
        )
      }

      throw AppException.badRequest(
        'Nenhum horário encontrado para esta matéria no calendário da turma. Verifique se a matéria está configurada no quadro de horários.'
      )
    }

    const results: { attendance: Attendance; studentAttendances: StudentHasAttendance[] }[] = []

    // Process each date
    for (const rawDate of data.dates) {
      // Vine may return JS Date or string; ensure we have Luxon DateTime
      let date: DateTime
      if (rawDate instanceof DateTime) {
        date = rawDate
      } else if (rawDate instanceof Date) {
        date = DateTime.fromJSDate(rawDate)
      } else {
        date = DateTime.fromISO(String(rawDate))
      }

      const weekday = date.weekday
      const timeStr = date.toFormat('HH:mm')

      // Find the exact slot matching weekday and time
      let slot = allSlots.find((s) => s.classWeekDay === weekday && s.startTime === timeStr)

      // Fallback: first slot for that weekday
      if (!slot) {
        slot = allSlots
          .filter((s) => s.classWeekDay === weekday)
          .sort((a, b) => (a.startTime as string).localeCompare(b.startTime as string))[0]
      }

      if (!slot) {
        // Skip this date if no slot found (shouldn't happen with valid available-dates)
        continue
      }

      const attendance = await Attendance.create({
        calendarSlotId: slot.id,
        date,
      })

      const studentAttendanceRecords = data.attendances.map((item) => ({
        studentId: item.studentId,
        attendanceId: attendance.id,
        status: mapStatus(item.status),
        justification: item.justification || null,
      }))

      const studentAttendances = await StudentHasAttendance.createMany(studentAttendanceRecords)

      results.push({ attendance, studentAttendances })
    }

    return response.created({
      count: results.length,
      results,
    })
  }
}
