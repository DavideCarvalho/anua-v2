import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Attendance from '#models/attendance'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import { batchCreateAttendanceValidator } from '#validators/attendance'
import AppException from '#exceptions/app_exception'
import AttendanceAuditService, { type AttendanceChange } from '#services/attendance_audit_service'

function mapStatus(validatorStatus: string): AttendanceStatus {
  return validatorStatus as AttendanceStatus
}

export default class BatchCreateAttendanceController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const data = await request.validateUsing(batchCreateAttendanceValidator)
    const editorId = (effectiveUser ?? auth.user)?.id ?? null

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
      .orderBy('createdAt', 'desc')
      .first()

    if (!calendar) {
      throw AppException.badRequest('Nenhum calendário ativo encontrado para esta turma e período.')
    }

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

    for (const rawDate of data.dates) {
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

      const slotByStart = allSlots.find((s) => {
        if (s.classWeekDay !== weekday) return false
        const start = String(s.startTime)
        return start.startsWith(timeStr)
      })

      const slotByEnd = allSlots.find((s) => {
        if (s.classWeekDay !== weekday) return false
        const end = String(s.endTime)
        return end.startsWith(timeStr)
      })

      const slot = slotByStart ?? slotByEnd
      if (!slot) continue

      const dateSql = normalizedDate.toSQL({ includeOffset: false })
      if (!dateSql) continue

      const existingAttendance = await Attendance.query()
        .where('calendarSlotId', slot.id)
        .where('date', dateSql)
        .first()

      let attendance: Attendance
      const existingByStudent = new Map<string, StudentHasAttendance>()

      if (existingAttendance) {
        attendance = existingAttendance
        attendance.lastEditedById = editorId
        attendance.lastEditedAt = DateTime.utc()
        await attendance.save()

        const existingShas = await StudentHasAttendance.query().where('attendanceId', attendance.id)
        for (const sha of existingShas) {
          existingByStudent.set(sha.studentId, sha)
        }
      } else {
        attendance = await Attendance.create({
          calendarSlotId: slot.id,
          date: normalizedDate,
          createdById: editorId,
        })
      }

      const payloadStudentIds = new Set(data.attendances.map((a) => a.studentId))

      // Drop students that were on the previous roll but aren't in the new payload.
      // Rare in normal flow; happens if a student left the class mid-period.
      const removedShas = [...existingByStudent.values()].filter(
        (sha) => !payloadStudentIds.has(sha.studentId)
      )
      if (removedShas.length > 0) {
        await StudentHasAttendance.query()
          .whereIn(
            'id',
            removedShas.map((s) => s.id)
          )
          .delete()
      }

      const changes: AttendanceChange[] = []
      const updates: StudentHasAttendance[] = []
      const creates: Partial<StudentHasAttendance>[] = []

      for (const item of data.attendances) {
        const newStatus = mapStatus(item.status)
        const newJustification = item.justification || null
        const existing = existingByStudent.get(item.studentId)

        if (existing) {
          const changed =
            existing.status !== newStatus || existing.justification !== newJustification

          if (changed) {
            changes.push({
              studentHasAttendanceId: existing.id,
              previousStatus: existing.status,
              previousJustification: existing.justification,
              newStatus,
              newJustification,
            })
            existing.status = newStatus
            existing.justification = newJustification
            updates.push(existing)
          }
        } else {
          creates.push({
            studentId: item.studentId,
            attendanceId: attendance.id,
            status: newStatus,
            justification: newJustification,
          })
        }
      }

      for (const sha of updates) {
        await sha.save()
      }

      let createdShas: StudentHasAttendance[] = []
      if (creates.length > 0) {
        createdShas = await StudentHasAttendance.createMany(creates)
      }

      if (changes.length > 0) {
        await AttendanceAuditService.recordEdits({ changes, editedById: editorId })
      }

      const allShas = [...existingByStudent.values(), ...createdShas].filter((sha) =>
        payloadStudentIds.has(sha.studentId)
      )

      results.push({ attendance, studentAttendances: allShas })
    }

    return response.created({
      count: results.length,
      results,
    })
  }
}
