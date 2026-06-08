import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AppException from '#exceptions/app_exception'
import Assignment from '#models/assignment'
import Event from '#models/event'
import Exam from '#models/exam'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import CalendarTokenService from '#services/calendar_token_service'

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function formatIcsDate(dt: DateTime, allDay: boolean): string {
  if (allDay) {
    return `;VALUE=DATE:${dt.toFormat('yyyyMMdd')}`
  }
  return `:${dt.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`
}

export default class GetCalendarFeedController {
  async handle({ params, response }: HttpContext) {
    const rawToken = (params.token as string).replace(/\.ics$/, '')
    const parsed = CalendarTokenService.verify(rawToken)

    if (!parsed) {
      throw AppException.forbidden('Link de calendário inválido ou expirado')
    }

    const { userId, studentId } = parsed

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', userId)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Relação responsável-aluno não encontrada')
    }

    const student = await Student.query()
      .where('id', studentId)
      .preload('user')
      .preload('class', (q) => q.preload('academicPeriods'))
      .first()

    if (!student || !student.classId || !student.class) {
      response.header('Content-Type', 'text/calendar; charset=utf-8')
      response.header('Content-Disposition', 'inline; filename="anua-calendario.ics"')
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Anua//Calendario//PT-BR',
        'CALSCALE:GREGORIAN',
        'X-WR-CALNAME:Anuá',
        'END:VCALENDAR',
      ].join('\r\n')
    }

    const now = DateTime.now()
    const rangeStart = now.minus({ months: 1 }).startOf('day')
    const rangeEnd = now.plus({ months: 6 }).endOf('day')
    const academicPeriodIds = student.class.academicPeriods.map((p) => p.id)

    const [assignments, exams, events] = await Promise.all([
      Assignment.query()
        .whereHas('teacherHasClass', (q) => q.where('classId', student.classId!))
        .where('dueDate', '>=', rangeStart.toSQL()!)
        .where('dueDate', '<=', rangeEnd.toSQL()!)
        .preload('teacherHasClass', (q) => {
          q.preload('subject')
        }),

      Exam.query()
        .where('classId', student.classId)
        .where('examDate', '>=', rangeStart.toSQL()!)
        .where('examDate', '<=', rangeEnd.toSQL()!)
        .preload('subject'),

      Event.query()
        .where('schoolId', student.class.schoolId)
        .where('startDate', '>=', rangeStart.toSQL()!)
        .where('startDate', '<=', rangeEnd.toSQL()!)
        .where((query) => {
          query.whereHas('eventAudiences', (aq) => {
            aq.where('scopeType', 'SCHOOL').where('scopeId', student.class.schoolId)
          })
          query.orWhereHas('eventAudiences', (aq) => {
            aq.where('scopeType', 'CLASS').where('scopeId', student.classId!)
          })
          if (academicPeriodIds.length > 0) {
            query.orWhereHas('eventAudiences', (aq) => {
              aq.where('scopeType', 'ACADEMIC_PERIOD').whereIn('scopeId', academicPeriodIds)
            })
          }
          if (student.class.levelId) {
            query.orWhereHas('eventAudiences', (aq) => {
              aq.where('scopeType', 'LEVEL').where('scopeId', student.class.levelId!)
            })
          }
        }),
    ])

    const studentName = student.user?.name ?? 'Aluno'
    const vevents: string[] = []

    for (const a of assignments) {
      const subject = a.teacherHasClass?.subject?.name
      const summary = subject ? `${a.name} (${subject})` : a.name
      vevents.push(
        'BEGIN:VEVENT',
        `UID:assignment-${a.id}@anua`,
        `DTSTART${formatIcsDate(a.dueDate, true)}`,
        `SUMMARY:${escapeIcs(summary)}`,
        ...(a.description ? [`DESCRIPTION:${escapeIcs(a.description)}`] : []),
        'CATEGORIES:Atividade',
        'END:VEVENT'
      )
    }

    for (const e of exams) {
      const subject = e.subject?.name
      const summary = subject ? `${e.title} (${subject})` : e.title
      vevents.push(
        'BEGIN:VEVENT',
        `UID:exam-${e.id}@anua`,
        `DTSTART${formatIcsDate(e.examDate, true)}`,
        `SUMMARY:${escapeIcs(summary)}`,
        ...(e.description ? [`DESCRIPTION:${escapeIcs(e.description)}`] : []),
        'CATEGORIES:Prova',
        'END:VEVENT'
      )
    }

    for (const ev of events) {
      const dtStart = formatIcsDate(ev.startDate, ev.isAllDay)
      const lines = ['BEGIN:VEVENT', `UID:event-${ev.id}@anua`, `DTSTART${dtStart}`]

      if (ev.endDate) {
        lines.push(`DTEND${formatIcsDate(ev.endDate, ev.isAllDay)}`)
      }

      lines.push(`SUMMARY:${escapeIcs(ev.title)}`)

      if (ev.description) {
        lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`)
      }
      if (ev.location) {
        lines.push(`LOCATION:${escapeIcs(ev.location)}`)
      }

      lines.push('CATEGORIES:Evento', 'END:VEVENT')
      vevents.push(...lines)
    }

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Anua//Calendario//PT-BR',
      'CALSCALE:GREGORIAN',
      `X-WR-CALNAME:Anuá - ${escapeIcs(studentName)}`,
      'METHOD:PUBLISH',
      ...vevents,
      'END:VCALENDAR',
    ].join('\r\n')

    response.header('Content-Type', 'text/calendar; charset=utf-8')
    response.header('Content-Disposition', `inline; filename="anua-${studentId}.ics"`)
    response.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    return ical
  }
}
