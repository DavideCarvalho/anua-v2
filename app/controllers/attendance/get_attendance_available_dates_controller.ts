import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodHoliday from '#models/academic_period_holiday'
import Attendance from '#models/attendance'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import AppException from '#exceptions/app_exception'

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo',
}

function toDateTime(v: DateTime | Date | string): DateTime {
  if (v instanceof DateTime) return v
  if (v instanceof Date) return DateTime.fromJSDate(v)
  return DateTime.fromISO(String(v))
}

/**
 * GET /api/v1/attendance/available-dates
 * Query: classId, academicPeriodId, subjectId
 *
 * Returns all class dates for the given subject in the period (excluding holidays
 * and dates that already have attendance). Same flow as school-super-app:
 * choose subject first, then pick from these dates only.
 */
export default class GetAttendanceAvailableDatesController {
  async handle({ request, response }: HttpContext) {
    const classId = request.input('classId')
    const academicPeriodId = request.input('academicPeriodId')
    const subjectId = request.input('subjectId')

    if (!classId || !academicPeriodId || !subjectId) {
      throw AppException.badRequest('classId, academicPeriodId e subjectId são obrigatórios.')
    }

    const calendar = await Calendar.query()
      .where('classId', classId)
      .where('academicPeriodId', academicPeriodId)
      .where('isActive', true)
      .where('isCanceled', false)
      .first()

    if (!calendar) {
      return response.ok({ dates: [] })
    }

    const period = await AcademicPeriod.find(academicPeriodId)
    if (!period) {
      return response.ok({ dates: [] })
    }

    const slots = await CalendarSlot.query()
      .where('calendarId', calendar.id)
      .where('isBreak', false)
      .whereNotNull('teacherHasClassId')
      .whereHas('teacherHasClass', (q) => q.where('subjectId', subjectId))
      .orderBy('classWeekDay')
      .orderBy('startTime')

    if (slots.length === 0) {
      return response.ok({ dates: [] })
    }

    // Group all slots by weekday (not just one per day)
    const slotsByWeekday = new Map<number, CalendarSlot[]>()
    for (const s of slots) {
      if (!slotsByWeekday.has(s.classWeekDay)) {
        slotsByWeekday.set(s.classWeekDay, [])
      }
      slotsByWeekday.get(s.classWeekDay)!.push(s)
    }

    const holidays = await AcademicPeriodHoliday.query()
      .where('academicPeriodId', academicPeriodId)
      .select('date')

    const holidayDates = new Set(
      holidays
        .map(
          (h) =>
            (h.date instanceof DateTime
              ? h.date
              : DateTime.fromJSDate(h.date as unknown as Date)
            ).toISODate() ?? ''
        )
        .filter(Boolean)
    )

    const slotIds = slots.map((s) => s.id)
    const startDt = toDateTime(period.startDate).startOf('day')
    const endDt = toDateTime(period.endDate).endOf('day')
    const startSql = startDt.toSQL()
    const endSql = endDt.toSQL()
    if (!startSql || !endSql) {
      return response.ok({ dates: [] })
    }

    const existing = await Attendance.query()
      .whereIn('calendarSlotId', slotIds)
      .where('date', '>=', startSql)
      .where('date', '<=', endSql)
      .select('calendarSlotId', 'date')

    const existingSet = new Set(
      existing.map((a) => {
        const d = a.date as DateTime
        const dt = d instanceof DateTime ? d : DateTime.fromJSDate(d as unknown as Date)
        return `${a.calendarSlotId}|${dt.toFormat('yyyy-MM-dd HH:mm')}`
      })
    )

    const start = toDateTime(period.startDate).startOf('day')
    const end = toDateTime(period.endDate).endOf('day')

    const startMonday = start.weekday === 1 ? start : start.plus({ days: 8 - start.weekday })
    const endMonday = end.weekday === 1 ? end : end.minus({ days: end.weekday - 1 })

    const results: { date: string; label: string; slotId: string }[] = []
    let weekStart = startMonday.startOf('day')

    while (weekStart <= endMonday) {
      // Iterate over all weekdays that have slots
      for (const [weekday, weekdaySlots] of slotsByWeekday) {
        // Iterate over ALL slots for this weekday (not just one)
        for (const slot of weekdaySlots) {
          const slotDate = weekStart.plus({ days: weekday - 1 })
          const parts = (slot.startTime as string).split(':')
          const h = Number(parts[0]) || 0
          const m = Number(parts[1]) || 0
          const dt = slotDate.set({ hour: h, minute: m, second: 0, millisecond: 0 })

          if (dt < start || dt > end) continue
          if (dt.weekday !== weekday) continue
          if (holidayDates.has(dt.toISODate() ?? '')) continue

          const key = `${slot.id}|${dt.toFormat('yyyy-MM-dd HH:mm')}`
          if (existingSet.has(key)) continue

          results.push({
            date: dt.toISO()!,
            label:
              `${WEEKDAY_LABELS[weekday] ?? ''}, ${dt.toFormat('dd/MM/yyyy')} às ${dt.toFormat('HH:mm')}`.trim(),
            slotId: slot.id,
          })
        }
      }
      weekStart = weekStart.plus({ weeks: 1 })
    }

    results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return response.ok({ dates: results })
  }
}
