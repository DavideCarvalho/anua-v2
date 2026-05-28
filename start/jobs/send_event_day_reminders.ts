import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

import Event from '#models/event'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import { notificationService } from '#services/notification_service'

const BR_TZ = 'America/Sao_Paulo'

const IMPORTANT_EVENT_TYPES = [
  'PARENTS_MEETING',
  'FIELD_TRIP',
  'SPORTS_EVENT',
  'SCHOOL_PARTY',
  'ARTS_SHOW',
  'SCIENCE_FAIR',
] as const

interface DayReminderStats {
  eventsProcessed: number
  recipientsConsidered: number
  pushSent: number
  pushSkippedAlreadySent: number
  pushFailed: number
}

interface DayReminderPayload {
  dryRun?: boolean
}

/**
 * Push matinal (D-0) lembrando eventos importantes que acontecem HOJE.
 * Critério estrito pra não virar spam: só dispara pra eventos onde o
 * responsável precisa agir presencialmente (reunião de pais, passeio,
 * evento esportivo) ou marcados como prioridade alta/urgente.
 *
 * Agrupa por usuário — se há 3 eventos importantes no mesmo dia, 1 push
 * consolidado em vez de 3 spams.
 *
 * Idempotência: marker em Notification por (userId, bucket = data BR).
 * 1 push por destinatário por dia.
 */
export async function sendEventDayReminders(
  payload: DayReminderPayload = {}
): Promise<DayReminderStats> {
  const { dryRun = false } = payload
  const stats: DayReminderStats = {
    eventsProcessed: 0,
    recipientsConsidered: 0,
    pushSent: 0,
    pushSkippedAlreadySent: 0,
    pushFailed: 0,
  }

  const now = DateTime.now()
  const startBr = now.setZone(BR_TZ).startOf('day')
  const endBr = startBr.endOf('day')
  const bucket = startBr.toISODate()!

  // Busca eventos importantes que começam hoje, em qualquer escola.
  // Filtra status != CANCELLED.
  const events = await Event.query()
    .where('startDate', '>=', startBr.toUTC().toSQL()!)
    .where('startDate', '<=', endBr.toUTC().toSQL()!)
    .where('status', '!=', 'CANCELLED')
    .where((q) => {
      q.where('requiresParentalConsent', true)
      q.orWhereIn('type', [...IMPORTANT_EVENT_TYPES])
      q.orWhereIn('priority', ['HIGH', 'URGENT'])
    })
    .preload('eventAudiences')

  if (events.length === 0) {
    logger.info('[event-day-reminders] no important events for today')
    return stats
  }

  stats.eventsProcessed = events.length

  // Mapeia evento → ids de estudantes alvo via audiências
  type EventTarget = { studentIds: Set<string>; event: Event }
  const eventTargets: EventTarget[] = []

  for (const event of events) {
    const studentQuery = Student.query()
      .preload('user')
      .preload('class', (q) => q.preload('academicPeriods'))

    studentQuery.where((q) => {
      let any = false
      for (const aud of event.eventAudiences) {
        any = true
        if (aud.scopeType === 'SCHOOL') {
          q.orWhereHas('user', (uq) => uq.where('schoolId', aud.scopeId))
        } else if (aud.scopeType === 'CLASS') {
          q.orWhere('classId', aud.scopeId)
        } else if (aud.scopeType === 'LEVEL') {
          q.orWhereHas('class', (cq) => cq.where('levelId', aud.scopeId))
        } else if (aud.scopeType === 'ACADEMIC_PERIOD') {
          q.orWhereHas('class', (cq) =>
            cq.whereHas('academicPeriods', (apq) => apq.where('AcademicPeriod.id', aud.scopeId))
          )
        }
      }
      if (!any) {
        // Sem audiências = ninguém atingido (fallback seguro: pula evento).
        q.whereRaw('1 = 0')
      }
    })

    const students = await studentQuery
    const studentIds = new Set(students.map((s) => s.id))
    if (studentIds.size === 0) continue
    eventTargets.push({ studentIds, event })
  }

  // Acumula por recipient (userId) → lista de eventos
  interface RecipientBundle {
    userId: string
    events: Event[]
    studentNames: Set<string>
  }
  const byRecipient = new Map<string, RecipientBundle>()

  for (const { studentIds, event } of eventTargets) {
    // Aluno autorresponsável: avisa o próprio aluno
    // Responsável pedagógico: avisa esse responsável
    const students = await Student.query()
      .whereIn('id', Array.from(studentIds))
      .preload('user')

    for (const student of students) {
      const studentName = student.user?.name ?? 'aluno'

      if (student.isSelfResponsible && student.user?.id) {
        const existing = byRecipient.get(student.user.id) ?? {
          userId: student.user.id,
          events: [] as Event[],
          studentNames: new Set<string>(),
        }
        existing.events.push(event)
        existing.studentNames.add(studentName)
        byRecipient.set(student.user.id, existing)
        continue
      }

      const links = await StudentHasResponsible.query()
        .where('studentId', student.id)
        .where('isPedagogical', true)
        .preload('responsible')

      for (const link of links) {
        if (!link.responsible) continue
        const existing = byRecipient.get(link.responsible.id) ?? {
          userId: link.responsible.id,
          events: [] as Event[],
          studentNames: new Set<string>(),
        }
        existing.events.push(event)
        existing.studentNames.add(studentName)
        byRecipient.set(link.responsible.id, existing)
      }
    }
  }

  stats.recipientsConsidered = byRecipient.size

  for (const bundle of byRecipient.values()) {
    // Anti-flood: 1 push por (userId, bucket-dia)
    const already = await Notification.query()
      .where('userId', bundle.userId)
      .where('type', 'EVENT_REMINDER')
      .whereRaw(`data->>'reminderBucket' = ?`, [bucket])
      .first()

    if (already) {
      stats.pushSkippedAlreadySent++
      continue
    }

    const uniqueEvents = Array.from(new Map(bundle.events.map((e) => [e.id, e])).values())
    const eventTitles = uniqueEvents.map((e) => e.title)
    const title =
      uniqueEvents.length === 1
        ? `Hoje na escola: ${eventTitles[0]}`
        : `Hoje na escola: ${uniqueEvents.length} eventos`

    const studentNames = Array.from(bundle.studentNames)
    const namesLabel =
      studentNames.length === 1
        ? studentNames[0]
        : studentNames.length === 2
          ? `${studentNames[0]} e ${studentNames[1]}`
          : `${studentNames.slice(0, -1).join(', ')} e ${studentNames[studentNames.length - 1]}`

    const message =
      uniqueEvents.length === 1
        ? `${eventTitles[0]} — ${namesLabel}`
        : `${eventTitles.join(', ')} — ${namesLabel}`

    if (dryRun) {
      logger.info(
        {
          userId: bundle.userId,
          bucket,
          eventCount: uniqueEvents.length,
          eventTitles,
        },
        '[event-day-reminders] dry-run'
      )
      stats.pushSent++
      continue
    }

    try {
      await notificationService.send({
        userId: bundle.userId,
        type: 'EVENT_REMINDER',
        title,
        message,
        actionUrl: '/responsavel/calendario',
        data: {
          reminderBucket: bucket,
          eventIds: uniqueEvents.map((e) => e.id),
        },
      })
      stats.pushSent++
    } catch (err) {
      stats.pushFailed++
      logger.error(
        { err, userId: bundle.userId, bucket },
        '[event-day-reminders] falha ao enviar lembrete'
      )
    }
  }

  logger.info({ stats, bucket }, '[event-day-reminders] done')
  return stats
}
