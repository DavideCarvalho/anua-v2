import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AcademicPeriodHoliday from '#models/academic_period_holiday'
import AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import Assignment from '#models/assignment'
import Class_ from '#models/class'
import Event from '#models/event'
import Exam from '#models/exam'
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

    const classRecord = await Class_.query()
      .where('id', classId)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .preload('academicPeriods', (query) => {
        query.whereNull('AcademicPeriod.deletedAt')
      })
      .first()

    if (!classRecord) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const academicPeriodIds = classRecord.academicPeriods.map((period) => period.id)
    const levelId = classRecord.levelId

    const events = await Event.query()
      .where('Event.schoolId', classRecord.schoolId)
      .where('Event.startDate', '>=', rangeStart.toSQL()!)
      .where('Event.startDate', '<=', rangeEnd.toSQL()!)
      .where((query) => {
        query
          .whereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'SCHOOL').where('scopeId', classRecord.schoolId)
          })
          .orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'CLASS').where('scopeId', classRecord.id)
          })
          .orWhereHas('eventAudiences', (audienceQuery) => {
            if (academicPeriodIds.length > 0) {
              audienceQuery
                .where('scopeType', 'ACADEMIC_PERIOD')
                .whereIn('scopeId', academicPeriodIds)
            }
          })
          .orWhereHas('eventAudiences', (audienceQuery) => {
            if (levelId) {
              audienceQuery.where('scopeType', 'LEVEL').where('scopeId', levelId)
            }
          })
      })

    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (query) => {
        query.where('classId', classRecord.id)
      })
      .where('dueDate', '>=', rangeStart.toSQL()!)
      .where('dueDate', '<=', rangeEnd.toSQL()!)
      .preload('teacherHasClass', (query) => {
        query.preload('subject')
      })

    const exams = await Exam.query()
      .where('classId', classRecord.id)
      .where('examDate', '>=', rangeStart.toSQL()!)
      .where('examDate', '<=', rangeEnd.toSQL()!)
      .preload('subject')

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
      classId: classRecord.id,
      academicPeriodId: academicPeriodIds[0] ?? null,
      meta: {
        eventType: event.type,
        status: event.status,
      },
    }))

    const assignmentItems: CalendarItem[] = assignments.map((assignment) => ({
      sourceType: 'ASSIGNMENT',
      sourceId: assignment.id,
      title: assignment.name,
      description: assignment.description,
      startAt: assignment.dueDate.toISO()!,
      endAt: null,
      isAllDay: true,
      readonly: false,
      schoolId: classRecord.schoolId,
      classId: classRecord.id,
      academicPeriodId: assignment.academicPeriodId,
      meta: {
        maxScore: assignment.grade,
        subjectName: assignment.teacherHasClass?.subject?.name,
      },
    }))

    const examItems: CalendarItem[] = exams.map((exam) => ({
      sourceType: 'EXAM',
      sourceId: exam.id,
      title: exam.title,
      description: exam.description,
      startAt: exam.examDate.toISO()!,
      endAt: null,
      isAllDay: true,
      readonly: false,
      schoolId: classRecord.schoolId,
      classId: classRecord.id,
      academicPeriodId: exam.academicPeriodId,
      meta: {
        examType: exam.type,
        status: exam.status,
        subjectName: exam.subject?.name,
      },
    }))

    const holidayItems: CalendarItem[] = holidays.map((holiday) => ({
      sourceType: 'HOLIDAY',
      sourceId: holiday.id,
      title: 'Feriado',
      description: null,
      startAt: holiday.date.toISO()!,
      endAt: null,
      isAllDay: true,
      readonly: true,
      schoolId: classRecord.schoolId,
      classId: classRecord.id,
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
      schoolId: classRecord.schoolId,
      classId: classRecord.id,
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
