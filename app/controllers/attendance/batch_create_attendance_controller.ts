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

    const subjectIds = Array.from(
      new Set([...(data.subjectIds ?? []), ...(data.subjectId ? [data.subjectId] : [])])
    )

    if (subjectIds.length === 0) {
      throw AppException.badRequest('Informe pelo menos uma matéria para registrar presença.')
    }

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
      .whereHas('teacherHasClass', (q) => q.whereIn('subjectId', subjectIds))

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
        'Nenhum horário encontrado para as matérias selecionadas no calendário da turma. Verifique se elas estão configuradas no quadro de horários.'
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

      const normalizedDate = date.toUTC().set({ second: 0, millisecond: 0 })
      const weekday = normalizedDate.weekday
      const timeStr = normalizedDate.toFormat('HH:mm')

      // Find the exact slot matching weekday and time
      // Prefer exact start-time match to avoid boundary ambiguity
      // Example: 08:15 can be end of previous slot and start of next slot
      const slotByStart = allSlots.find((s) => {
        if (s.classWeekDay !== weekday) return false
        const start = String(s.startTime)
        return start.startsWith(timeStr)
      })

      // Fallback to end-time only when start-time is not found
      const slotByEnd = allSlots.find((s) => {
        if (s.classWeekDay !== weekday) return false
        const end = String(s.endTime)
        return end.startsWith(timeStr)
      })

      const slot = slotByStart ?? slotByEnd

      if (!slot) {
        // Skip this date if no slot found (shouldn't happen with valid available-dates)
        continue
      }

      // Check if attendance already exists for this slot and date
      const dateSql = normalizedDate.toSQL({ includeOffset: false })
      if (!dateSql) {
        continue
      }

      const existingAttendance = await Attendance.query()
        .where('calendarSlotId', slot.id)
        .where('date', dateSql)
        .first()

      let attendance: Attendance

      if (existingAttendance) {
        // Update existing attendance - remove old student records and create new ones
        await StudentHasAttendance.query().where('attendanceId', existingAttendance.id).delete()

        attendance = existingAttendance
      } else {
        // Create new attendance
        attendance = await Attendance.create({
          calendarSlotId: slot.id,
          date: normalizedDate,
        })
      }

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
