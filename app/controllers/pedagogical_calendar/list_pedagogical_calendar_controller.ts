import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AcademicPeriodHoliday from '#models/academic_period_holiday'
import AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import Assignment from '#models/assignment'
import Class_ from '#models/class'
import Event from '#models/event'
import Exam from '#models/exam'
import TeacherHasClass from '#models/teacher_has_class'
import { listPedagogicalCalendarValidator } from '#validators/pedagogical_calendar'

type SourceType = 'EVENT' | 'ASSIGNMENT' | 'EXAM' | 'HOLIDAY' | 'WEEKEND_CLASS_DAY'

interface CalendarItem {
  sourceType: SourceType
  sourceId: string | null
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  isAllDay: boolean
  readonly: boolean
  schoolId: string
  classId: string | null
  academicPeriodId: string | null
  meta: Record<string, unknown>
}

function applyTimeToDate(baseDate: DateTime, time: string | null): DateTime {
  if (!time) return baseDate.startOf('day')

  const [hourString, minuteString] = time.split(':')
  const hour = Number.parseInt(hourString ?? '0', 10)
  const minute = Number.parseInt(minuteString ?? '0', 10)

  return baseDate.set({ hour, minute, second: 0, millisecond: 0 })
}

export default class ListPedagogicalCalendarController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const { classId, startDate, endDate } = await request.validateUsing(
      listPedagogicalCalendarValidator
    )

    const rangeStart = startDate
      ? DateTime.fromISO(startDate)
      : DateTime.now().startOf('month').startOf('day')
    const rangeEnd = endDate
      ? DateTime.fromISO(endDate)
      : DateTime.now().endOf('month').endOf('day')

    if (!rangeStart.isValid || !rangeEnd.isValid) {
      return response.badRequest({ message: 'Intervalo de datas inválido' })
    }

    const classesQuery = Class_.query().whereIn('schoolId', selectedSchoolIds ?? [])

    if (classId) {
      classesQuery.where('id', classId)
    }

    const classRecords = await classesQuery.preload('academicPeriods', (query) => {
      query.whereNull('AcademicPeriod.deletedAt')
    })

    if (classId && classRecords.length === 0) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    if (classRecords.length === 0) {
      return response.ok({ data: [] })
    }

    const schoolId = classRecords[0].schoolId
    const classIds = classRecords.map((record) => record.id)
    const levelIds = Array.from(
      new Set(
        classRecords
          .map((record) => record.levelId)
          .filter((levelId): levelId is string => !!levelId)
      )
    )

    const academicPeriodIds = Array.from(
      new Set(
        classRecords
          .flatMap((record) => record.academicPeriods.map((period) => period.id))
          .filter((periodId): periodId is string => !!periodId)
      )
    )

    const events = await Event.query()
      .where('Event.schoolId', schoolId)
      .where('Event.startDate', '>=', rangeStart.toSQL()!)
      .where('Event.startDate', '<=', rangeEnd.toSQL()!)
      .where((query) => {
        query.whereHas('eventAudiences', (audienceQuery) => {
          audienceQuery.where('scopeType', 'SCHOOL').where('scopeId', schoolId)
        })

        if (classIds.length > 0) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'CLASS').whereIn('scopeId', classIds)
          })
        }

        if (academicPeriodIds.length > 0) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery
              .where('scopeType', 'ACADEMIC_PERIOD')
              .whereIn('scopeId', academicPeriodIds)
          })
        }

        if (levelIds.length > 0) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'LEVEL').whereIn('scopeId', levelIds)
          })
        }
      })

    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (query) => {
        query.whereIn('classId', classIds)
      })
      .where('dueDate', '>=', rangeStart.toSQL()!)
      .where('dueDate', '<=', rangeEnd.toSQL()!)
      .preload('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
      })

    const exams = await Exam.query()
      .whereIn('classId', classIds)
      .where('examDate', '>=', rangeStart.toSQL()!)
      .where('examDate', '<=', rangeEnd.toSQL()!)
      .preload('subject')

    const classSchedules = await TeacherHasClass.query()
      .whereIn('classId', classIds)
      .where('isActive', true)
      .select('classId', 'subjectId', 'startTime', 'endTime')

    const scheduleByClassAndSubject = new Map<
      string,
      { startTime: string | null; endTime: string | null }
    >()

    for (const schedule of classSchedules) {
      const key = `${schedule.classId}:${schedule.subjectId}`
      if (!scheduleByClassAndSubject.has(key)) {
        scheduleByClassAndSubject.set(key, {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })
      }
    }

    const holidays = await AcademicPeriodHoliday.query()
      .whereIn('academicPeriodId', academicPeriodIds)
      .where('date', '>=', rangeStart.toISODate()!)
      .where('date', '<=', rangeEnd.toISODate()!)

    const weekendClassDays = await AcademicPeriodWeekendClass.query()
      .whereIn('academicPeriodId', academicPeriodIds)
      .where('date', '>=', rangeStart.toISODate()!)
      .where('date', '<=', rangeEnd.toISODate()!)

    const eventItems: CalendarItem[] = events.map((event) => ({
      sourceType: 'EVENT',
      sourceId: event.id,
      title: event.title,
      description: event.description,
      startAt: event.startDate.toISO()!,
      endAt: event.endDate?.toISO() ?? null,
      isAllDay: event.isAllDay,
      readonly: false,
      schoolId: event.schoolId,
      classId: null,
      academicPeriodId: academicPeriodIds[0] ?? null,
      meta: {
        eventType: event.type,
        status: event.status,
      },
    }))

    const assignmentItems: CalendarItem[] = assignments.map((assignment) => {
      const classStartTime = assignment.teacherHasClass?.startTime ?? null
      const classEndTime = assignment.teacherHasClass?.endTime ?? null

      const startAt = applyTimeToDate(assignment.dueDate, classStartTime)
      const endAt = classEndTime
        ? applyTimeToDate(assignment.dueDate, classEndTime)
        : classStartTime
          ? startAt.plus({ minutes: 50 })
          : null

      return {
        sourceType: 'ASSIGNMENT',
        sourceId: assignment.id,
        title: assignment.name,
        description: assignment.description,
        startAt: startAt.toISO()!,
        endAt: endAt?.toISO() ?? null,
        isAllDay: !classStartTime,
        readonly: false,
        schoolId,
        classId: assignment.teacherHasClass?.classId ?? null,
        academicPeriodId: assignment.academicPeriodId,
        meta: {
          maxScore: assignment.grade,
          subjectName: assignment.teacherHasClass?.subject?.name,
        },
      }
    })

    const examItems: CalendarItem[] = exams.map((exam) => {
      const schedule = scheduleByClassAndSubject.get(`${exam.classId}:${exam.subjectId ?? ''}`)
      const startTime = schedule?.startTime ?? null
      const endTime = schedule?.endTime ?? null

      const startAt = applyTimeToDate(exam.examDate, startTime)
      const endAt = endTime
        ? applyTimeToDate(exam.examDate, endTime)
        : startTime
          ? startAt.plus({ minutes: 50 })
          : null

      return {
        sourceType: 'EXAM',
        sourceId: exam.id,
        title: exam.title,
        description: exam.description,
        startAt: startAt.toISO()!,
        endAt: endAt?.toISO() ?? null,
        isAllDay: !startTime,
        readonly: false,
        schoolId,
        classId: exam.classId,
        academicPeriodId: exam.academicPeriodId,
        meta: {
          examType: exam.type,
          status: exam.status,
          subjectName: exam.subject?.name,
        },
      }
    })

    const holidayItems: CalendarItem[] = holidays.map((holiday) => ({
      sourceType: 'HOLIDAY',
      sourceId: holiday.id,
      title: 'Feriado',
      description: null,
      startAt: holiday.date.toISO()!,
      endAt: null,
      isAllDay: true,
      readonly: true,
      schoolId,
      classId: null,
      academicPeriodId: holiday.academicPeriodId,
      meta: {},
    }))

    const weekendClassItems: CalendarItem[] = weekendClassDays.map((weekendClassDay) => ({
      sourceType: 'WEEKEND_CLASS_DAY',
      sourceId: weekendClassDay.id,
      title: 'Fim de semana letivo',
      description: null,
      startAt: weekendClassDay.date.toISO()!,
      endAt: null,
      isAllDay: true,
      readonly: true,
      schoolId,
      classId: null,
      academicPeriodId: weekendClassDay.academicPeriodId,
      meta: {},
    }))

    const data = [
      ...eventItems,
      ...assignmentItems,
      ...examItems,
      ...holidayItems,
      ...weekendClassItems,
    ].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

    return response.ok({ data })
  }
}
