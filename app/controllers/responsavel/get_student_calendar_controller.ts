import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AppException from '#exceptions/app_exception'
import Assignment from '#models/assignment'
import Event from '#models/event'
import Exam from '#models/exam'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { getStudentCalendarValidator } from '#validators/responsavel_calendar'

type CalendarView = 'list' | 'week' | 'month'

function resolveRange(view: CalendarView, from?: string, to?: string) {
  const now = DateTime.now()

  const parsedFrom = from ? DateTime.fromISO(from) : null
  const parsedTo = to ? DateTime.fromISO(to) : null

  if (from && !parsedFrom?.isValid) {
    throw AppException.badRequest('Parâmetro from inválido')
  }

  if (to && !parsedTo?.isValid) {
    throw AppException.badRequest('Parâmetro to inválido')
  }

  if (!parsedFrom && !parsedTo) {
    if (view === 'list') {
      return {
        rangeStart: now.startOf('day'),
        rangeEnd: now.plus({ days: 30 }).endOf('day'),
      }
    }

    if (view === 'week') {
      return {
        rangeStart: now.startOf('week').startOf('day'),
        rangeEnd: now.endOf('week').endOf('day'),
      }
    }

    return {
      rangeStart: now.startOf('month').startOf('day'),
      rangeEnd: now.endOf('month').endOf('day'),
    }
  }

  if (parsedFrom && parsedTo && parsedFrom > parsedTo) {
    throw AppException.badRequest('Parâmetro from deve ser menor ou igual a to')
  }

  if (parsedFrom && parsedTo) {
    return {
      rangeStart: parsedFrom.startOf('day'),
      rangeEnd: parsedTo.endOf('day'),
    }
  }

  if (parsedFrom) {
    if (view === 'list') {
      return {
        rangeStart: parsedFrom.startOf('day'),
        rangeEnd: parsedFrom.plus({ days: 30 }).endOf('day'),
      }
    }

    return {
      rangeStart: parsedFrom.startOf(view === 'week' ? 'week' : 'month').startOf('day'),
      rangeEnd: parsedFrom.endOf(view === 'week' ? 'week' : 'month').endOf('day'),
    }
  }

  if (view === 'list') {
    return {
      rangeStart: parsedTo!.minus({ days: 30 }).startOf('day'),
      rangeEnd: parsedTo!.endOf('day'),
    }
  }

  return {
    rangeStart: parsedTo!.startOf(view === 'week' ? 'week' : 'month').startOf('day'),
    rangeEnd: parsedTo!.endOf(view === 'week' ? 'week' : 'month').endOf('day'),
  }
}

export default class GetStudentCalendarController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const { view = 'list', from, to } = await request.validateUsing(getStudentCalendarValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver o calendário deste aluno')
    }

    const student = await Student.query()
      .where('id', studentId)
      .preload('class', (query) => {
        query.preload('academicPeriods')
      })
      .first()

    if (!student) {
      throw AppException.notFound('Aluno nao encontrado')
    }

    if (!student.classId || !student.class) {
      return {
        items: [],
        meta: {
          studentId,
          view,
          from: DateTime.now().startOf('day').toISO()!,
          to: DateTime.now().endOf('day').toISO()!,
          timezone: DateTime.now().zoneName,
        },
      }
    }

    const { rangeStart, rangeEnd } = resolveRange(view, from, to)
    const academicPeriodIds = student.class.academicPeriods.map((period) => period.id)

    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (query) => {
        query.where('classId', student.classId!)
      })
      .where('dueDate', '>=', rangeStart.toSQL()!)
      .where('dueDate', '<=', rangeEnd.toSQL()!)
      .preload('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
      })

    const exams = await Exam.query()
      .where('classId', student.classId)
      .where('examDate', '>=', rangeStart.toSQL()!)
      .where('examDate', '<=', rangeEnd.toSQL()!)
      .preload('class')
      .preload('subject')

    const events = await Event.query()
      .where('schoolId', student.class.schoolId)
      .where('startDate', '>=', rangeStart.toSQL()!)
      .where('startDate', '<=', rangeEnd.toSQL()!)
      .where((query) => {
        query.whereHas('eventAudiences', (audienceQuery) => {
          audienceQuery.where('scopeType', 'SCHOOL').where('scopeId', student.class.schoolId)
        })

        query.orWhereHas('eventAudiences', (audienceQuery) => {
          audienceQuery.where('scopeType', 'CLASS').where('scopeId', student.classId!)
        })

        if (academicPeriodIds.length > 0) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery
              .where('scopeType', 'ACADEMIC_PERIOD')
              .whereIn('scopeId', academicPeriodIds)
          })
        }

        if (student.class.levelId) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'LEVEL').where('scopeId', student.class.levelId!)
          })
        }
      })

    const items = [
      ...assignments.map((assignment) => ({
        id: `assignment:${assignment.id}`,
        sourceType: 'assignment',
        sourceId: assignment.id,
        title: assignment.name,
        description: assignment.description,
        startAt: assignment.dueDate.toISO()!,
        endAt: null,
        allDay: true,
        className: assignment.teacherHasClass?.class?.name ?? student.class.name,
        subjectName: assignment.teacherHasClass?.subject?.name ?? null,
        status: null,
        colorToken: 'assignment',
      })),
      ...exams.map((exam) => ({
        id: `exam:${exam.id}`,
        sourceType: 'exam',
        sourceId: exam.id,
        title: exam.title,
        description: exam.description,
        startAt: exam.examDate.toISO()!,
        endAt: exam.endTime?.toISO() ?? null,
        allDay: true,
        className: exam.class?.name ?? student.class.name,
        subjectName: exam.subject?.name ?? null,
        status: exam.status,
        colorToken: 'exam',
      })),
      ...events.map((event) => ({
        id: `event:${event.id}`,
        sourceType: 'event',
        sourceId: event.id,
        title: event.title,
        description: event.description,
        startAt: event.startDate.toISO()!,
        endAt: event.endDate?.toISO() ?? null,
        allDay: event.isAllDay,
        className: student.class.name,
        subjectName: null,
        status: event.status,
        colorToken: 'event',
      })),
    ].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

    return {
      items,
      meta: {
        studentId,
        view,
        from: rangeStart.toISO()!,
        to: rangeEnd.toISO()!,
        timezone: DateTime.now().zoneName,
      },
    }
  }
}
