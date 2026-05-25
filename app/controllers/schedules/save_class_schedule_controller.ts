import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Attendance from '#models/attendance'
import StudentHasAttendance from '#models/student_has_attendance'
import db from '@adonisjs/lucid/services/db'
import AppException from '#exceptions/app_exception'
import { AppErrorCode } from '#exceptions/app_error_code'
import { saveClassScheduleValidator } from '#validators/schedules'

interface SlotInput {
  teacherHasClassId: string | null
  classWeekDay: number
  startTime: string
  endTime: string
  isBreak?: boolean
}

export default class SaveClassScheduleController {
  async handle({ params, request, response, logger }: HttpContext) {
    const classId = params.classId
    const payload = await request.validateUsing(saveClassScheduleValidator)
    const academicPeriodId = payload.academicPeriodId
    const forceRemoveAttendance = payload.forceRemoveAttendance ?? false
    const slots = payload.slots as SlotInput[]

    if (!academicPeriodId) {
      throw AppException.badRequest('academicPeriodId é obrigatório')
    }

    if (!slots || !Array.isArray(slots)) {
      throw AppException.badRequest('slots deve ser um array')
    }

    try {
      await db.transaction(async (trx) => {
        let calendar = await Calendar.query({ client: trx })
          .where('classId', classId)
          .where('academicPeriodId', academicPeriodId)
          .where('isActive', true)
          .where('isCanceled', false)
          .first()

        if (!calendar) {
          calendar = await Calendar.create(
            {
              id: randomUUID(),
              classId,
              academicPeriodId,
              name: 'Grade de Horários',
              isActive: true,
              isCanceled: false,
              isApproved: false,
            },
            { client: trx }
          )
        }

        const existingSlots = await CalendarSlot.query({ client: trx })
          .where('calendarId', calendar.id)

        const existingByPosition = new Map<string, CalendarSlot>()
        for (const slot of existingSlots) {
          existingByPosition.set(
            slotPositionKey(slot.classWeekDay, slot.startTime, slot.endTime),
            slot
          )
        }

        const matchedIds = new Set<string>()

        for (const slot of slots) {
          const key = slotPositionKey(slot.classWeekDay, slot.startTime, slot.endTime)
          const existing = existingByPosition.get(key)

          if (existing) {
            matchedIds.add(existing.id)
            const newIsBreak = slot.isBreak ?? false
            if (
              existing.teacherHasClassId !== slot.teacherHasClassId ||
              existing.isBreak !== newIsBreak
            ) {
              existing.useTransaction(trx)
              existing.teacherHasClassId = slot.teacherHasClassId
              existing.isBreak = newIsBreak
              await existing.save()
            }
          } else {
            await CalendarSlot.create(
              {
                id: randomUUID(),
                calendarId: calendar.id,
                teacherHasClassId: slot.teacherHasClassId,
                classWeekDay: slot.classWeekDay,
                startTime: slot.startTime,
                endTime: slot.endTime,
                minutes: calculateMinutes(slot.startTime, slot.endTime),
                isBreak: slot.isBreak ?? false,
              },
              { client: trx }
            )
          }
        }

        const unmatchedSlots = existingSlots.filter((s) => !matchedIds.has(s.id))

        if (unmatchedSlots.length > 0) {
          const unmatchedIds = unmatchedSlots.map((s) => s.id)

          const attendances = await Attendance.query({ client: trx })
            .whereIn('calendarSlotId', unmatchedIds)
            .preload('calendarSlot', (q) =>
              q.preload('teacherHasClass', (q2) => q2.preload('subject'))
            )

          if (attendances.length > 0) {
            if (!forceRemoveAttendance) {
              const studentCounts = await StudentHasAttendance.query({ client: trx })
                .whereIn(
                  'attendanceId',
                  attendances.map((a) => a.id)
                )
                .groupBy('attendanceId')
                .count('* as total')
                .select('attendanceId')

              const countByAttendance = new Map(
                studentCounts.map((r) => [r.attendanceId, Number(r.$extras.total)])
              )

              const affectedAttendances = attendances.map((a) => ({
                date: a.date.toFormat('dd/MM/yyyy'),
                dayOfWeek: a.calendarSlot.classWeekDay,
                startTime: a.calendarSlot.startTime.substring(0, 5),
                endTime: a.calendarSlot.endTime.substring(0, 5),
                subjectName: a.calendarSlot.teacherHasClass?.subject?.name ?? null,
                studentCount: countByAttendance.get(a.id) ?? 0,
              }))

              throw new AppException({
                code: AppErrorCode.SCHEDULE_HAS_ATTENDANCE,
                status: 409,
                description: `${attendances.length} presença(s) registrada(s) em horários que serão removidos serão perdidas.`,
                meta: { attendanceCount: attendances.length, affectedAttendances },
              })
            }

            const attendanceIds = attendances.map((a) => a.id)
            await StudentHasAttendance.query({ client: trx })
              .whereIn('attendanceId', attendanceIds)
              .delete()
            await Attendance.query({ client: trx }).whereIn('id', attendanceIds).delete()
          }

          await CalendarSlot.query({ client: trx }).whereIn('id', unmatchedIds).delete()
        }
      })

      return response.noContent()
    } catch (error) {
      if (error instanceof AppException) throw error
      logger.error({ error }, 'Error saving schedule')
      throw AppException.internalServerError('Falha ao salvar grade de horários')
    }
  }
}

function slotPositionKey(classWeekDay: number, startTime: string, endTime: string): string {
  return `${classWeekDay}_${startTime.substring(0, 5)}_${endTime.substring(0, 5)}`
}

function calculateMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  return endH * 60 + endM - (startH * 60 + startM)
}
