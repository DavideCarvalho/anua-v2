import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
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

    const calendar = await Calendar.query()
      .where('classId', data.classId)
      .where('academicPeriodId', data.academicPeriodId)
      .where('isActive', true)
      .where('isCanceled', false)
      .first()

    if (!calendar) {
      return response.badRequest({
        message: 'Nenhum calendário ativo encontrado para esta turma e período.',
      })
    }

    // Vine may return JS Date or string; ensure we have Luxon DateTime for .weekday and Attendance.
    let date: DateTime
    if (data.date instanceof DateTime) {
      date = data.date
    } else if (data.date instanceof Date) {
      date = DateTime.fromJSDate(data.date)
    } else {
      date = DateTime.fromISO(String(data.date))
    }

    // Luxon weekday: 1 = Monday, 7 = Sunday. Generate uses 1–5 (Mon–Fri).
    const weekday = date.weekday

    const slot = await CalendarSlot.query()
      .where('calendarId', calendar.id)
      .where('classWeekDay', weekday)
      .where('isBreak', false)
      .whereNotNull('teacherHasClassId')
      .whereHas('teacherHasClass', (q) => q.where('subjectId', data.subjectId))
      .orderBy('startTime')
      .first()

    if (!slot) {
      return response.badRequest({
        message:
          'Nenhum horário encontrado para esta matéria no dia da semana selecionado. Verifique o calendário da turma.',
      })
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

    return response.created({
      attendance,
      studentAttendances,
    })
  }
}
