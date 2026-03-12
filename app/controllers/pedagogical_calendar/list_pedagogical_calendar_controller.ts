import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AcademicPeriodHoliday from '#models/academic_period_holiday'
import AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import Assignment from '#models/assignment'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import Class_ from '#models/class'
import Event from '#models/event'
import Exam from '#models/exam'
import School from '#models/school'
import TeacherHasClass from '#models/teacher_has_class'
import User from '#models/user'
import PedagogicalCalendarItemTransformer, {
  type PedagogicalCalendarItem as CalendarItem,
} from '#transformers/pedagogical_calendar_item_transformer'
import { listPedagogicalCalendarValidator } from '#validators/pedagogical_calendar'

function applyTimeToDate(baseDate: DateTime, time: string | null): DateTime {
  if (!time) return baseDate.startOf('day')

  const [hourString, minuteString] = time.split(':')
  const hour = Number.parseInt(hourString ?? '0', 10)
  const minute = Number.parseInt(minuteString ?? '0', 10)

  return baseDate.set({ hour, minute, second: 0, millisecond: 0 })
}

function getScheduleTimeScore(schedule: {
  startTime: string | null
  endTime: string | null
}): number {
  if (schedule.startTime && schedule.endTime) return 2
  if (schedule.startTime) return 1
  return 0
}

export default class ListPedagogicalCalendarController {
  async handle({ request, response, selectedSchoolIds, serialize }: HttpContext) {
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
    const school = await School.find(schoolId)
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
      .preload('academicPeriod')
      .preload('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
        query.preload('teacher', (teacherQuery) => {
          teacherQuery.preload('user')
        })
      })

    const exams = await Exam.query()
      .whereIn('classId', classIds)
      .where('examDate', '>=', rangeStart.toSQL()!)
      .where('examDate', '<=', rangeEnd.toSQL()!)
      .preload('class')
      .preload('teacher', (teacherQuery) => {
        teacherQuery.preload('user')
      })
      .preload('academicPeriod')
      .preload('subject')

    const classSchedules = await TeacherHasClass.query()
      .whereIn('classId', classIds)
      .where('isActive', true)
      .select('classId', 'subjectId', 'startTime', 'endTime')

    const activeCalendars = await Calendar.query()
      .whereIn('classId', classIds)
      .where('isActive', true)
      .where('isCanceled', false)

    const activeCalendarIds = activeCalendars.map((calendar) => calendar.id)

    const calendarSlots =
      activeCalendarIds.length > 0
        ? await CalendarSlot.query()
            .whereIn('calendarId', activeCalendarIds)
            .whereNotNull('teacherHasClassId')
            .where('isBreak', false)
            .preload('teacherHasClass', (query) => {
              query.select('id', 'classId', 'subjectId')
            })
        : []

    const scheduleByClassAndSubject = new Map<
      string,
      { startTime: string | null; endTime: string | null }
    >()

    const slotByTeacherHasClassAndWeekday = new Map<
      string,
      { startTime: string; endTime: string }
    >()
    const slotByTeacherHasClass = new Map<string, { startTime: string; endTime: string }>()
    const slotByClassSubjectAndWeekday = new Map<string, { startTime: string; endTime: string }>()
    const slotByClassSubject = new Map<string, { startTime: string; endTime: string }>()

    for (const schedule of classSchedules) {
      const key = `${schedule.classId}:${schedule.subjectId}`
      const candidate = { startTime: schedule.startTime, endTime: schedule.endTime }
      const current = scheduleByClassAndSubject.get(key)

      if (!current || getScheduleTimeScore(candidate) > getScheduleTimeScore(current)) {
        scheduleByClassAndSubject.set(key, candidate)
      }
    }

    for (const slot of calendarSlots) {
      if (!slot.teacherHasClassId || !slot.teacherHasClass) continue

      const candidate = {
        startTime: slot.startTime,
        endTime: slot.endTime,
      }

      const keyByTeacherAndDay = `${slot.teacherHasClassId}:${slot.classWeekDay}`
      const keyByTeacher = slot.teacherHasClassId

      if (!slotByTeacherHasClassAndWeekday.has(keyByTeacherAndDay)) {
        slotByTeacherHasClassAndWeekday.set(keyByTeacherAndDay, candidate)
      }

      if (!slotByTeacherHasClass.has(keyByTeacher)) {
        slotByTeacherHasClass.set(keyByTeacher, candidate)
      }

      const subjectId = slot.teacherHasClass.subjectId
      const classIdFromSlot = slot.teacherHasClass.classId

      const keyByClassSubjectAndDay = `${classIdFromSlot}:${subjectId}:${slot.classWeekDay}`
      const keyByClassSubject = `${classIdFromSlot}:${subjectId}`

      if (!slotByClassSubjectAndWeekday.has(keyByClassSubjectAndDay)) {
        slotByClassSubjectAndWeekday.set(keyByClassSubjectAndDay, candidate)
      }

      if (!slotByClassSubject.has(keyByClassSubject)) {
        slotByClassSubject.set(keyByClassSubject, candidate)
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

    const teacherIds = Array.from(
      new Set([
        ...assignments
          .map((assignment) => assignment.teacherHasClass?.teacherId)
          .filter((id): id is string => !!id),
        ...exams.map((exam) => exam.teacherId).filter((id): id is string => !!id),
      ])
    )

    const teacherUsers =
      teacherIds.length > 0 ? await User.query().whereIn('id', teacherIds).select('id', 'name') : []
    const teacherUserNameById = new Map(
      teacherUsers.map((teacherUser) => [teacherUser.id, teacherUser.name])
    )

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
      const assignmentWeekDay = assignment.dueDate.toJSDate().getDay()
      const slotSchedule = assignment.teacherHasClassId
        ? (slotByTeacherHasClassAndWeekday.get(
            `${assignment.teacherHasClassId}:${assignmentWeekDay}`
          ) ?? slotByTeacherHasClass.get(assignment.teacherHasClassId))
        : undefined

      const classStartTime =
        slotSchedule?.startTime ?? assignment.teacherHasClass?.startTime ?? null
      const classEndTime = slotSchedule?.endTime ?? assignment.teacherHasClass?.endTime ?? null

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
        teacherName:
          assignment.teacherHasClass?.teacher?.user?.name ??
          (assignment.teacherHasClass?.teacherId
            ? (teacherUserNameById.get(assignment.teacherHasClass.teacherId) ?? null)
            : null),
        school,
        class: assignment.teacherHasClass?.class ?? null,
        subject: assignment.teacherHasClass?.subject ?? null,
        academicPeriod: assignment.academicPeriod ?? null,
        teacher: assignment.teacherHasClass?.teacher ?? null,
        meta: {
          maxScore: assignment.grade,
          subjectName: assignment.teacherHasClass?.subject?.name,
        },
      }
    })

    const examItems: CalendarItem[] = exams.map((exam) => {
      const examWeekDay = exam.examDate.toJSDate().getDay()
      const slotSchedule =
        slotByClassSubjectAndWeekday.get(
          `${exam.classId}:${exam.subjectId ?? ''}:${examWeekDay}`
        ) ?? slotByClassSubject.get(`${exam.classId}:${exam.subjectId ?? ''}`)

      const fallbackSchedule = scheduleByClassAndSubject.get(
        `${exam.classId}:${exam.subjectId ?? ''}`
      )
      const startTime = slotSchedule?.startTime ?? fallbackSchedule?.startTime ?? null
      const endTime = slotSchedule?.endTime ?? fallbackSchedule?.endTime ?? null

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
        teacherName:
          exam.teacher?.user?.name ??
          (exam.teacherId ? (teacherUserNameById.get(exam.teacherId) ?? null) : null),
        school,
        class: exam.class ?? null,
        subject: exam.subject ?? null,
        academicPeriod: exam.academicPeriod ?? null,
        teacher: exam.teacher ?? null,
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
      school,
      classId: null,
      academicPeriodId: holiday.academicPeriodId,
      academicPeriod:
        classRecords
          .flatMap((record) => record.academicPeriods)
          .find((period) => period.id === holiday.academicPeriodId) ?? null,
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
      school,
      classId: null,
      academicPeriodId: weekendClassDay.academicPeriodId,
      academicPeriod:
        classRecords
          .flatMap((record) => record.academicPeriods)
          .find((period) => period.id === weekendClassDay.academicPeriodId) ?? null,
      meta: {},
    }))

    const data = [
      ...eventItems,
      ...assignmentItems,
      ...examItems,
      ...holidayItems,
      ...weekendClassItems,
    ].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

    return response.ok({
      data: await serialize(PedagogicalCalendarItemTransformer.transform(data)),
    })
  }
}
