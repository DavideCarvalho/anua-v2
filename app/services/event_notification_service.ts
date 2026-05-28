import logger from '@adonisjs/core/services/logger'

import Event from '#models/event'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { notificationService } from '#services/notification_service'

/**
 * Resolve os userIds que devem ser notificados sobre um evento, baseado nas
 * audiências (SCHOOL/CLASS/LEVEL/ACADEMIC_PERIOD). Inclui responsáveis
 * pedagógicos + alunos autorresponsáveis.
 */
async function resolveEventRecipients(event: Event): Promise<string[]> {
  if (!event.eventAudiences || event.eventAudiences.length === 0) {
    await event.load('eventAudiences')
  }

  if (event.eventAudiences.length === 0) {
    return []
  }

  const studentQuery = Student.query().preload('user')

  studentQuery.where((q) => {
    for (const aud of event.eventAudiences) {
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
  })

  const students = await studentQuery
  const recipientIds = new Set<string>()

  for (const student of students) {
    if (student.isSelfResponsible && student.user?.id) {
      recipientIds.add(student.user.id)
      continue
    }

    const links = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .where('isPedagogical', true)
      .preload('responsible')

    for (const link of links) {
      if (link.responsible) recipientIds.add(link.responsible.id)
    }
  }

  return Array.from(recipientIds)
}

export interface EventNotificationContext {
  event: Event
}

/**
 * Dispara push imediato (+ email + WhatsApp + in-app via NotificationService)
 * quando um evento é cancelado. Cada destinatário recebe 1 notificação.
 */
export async function notifyEventCancelled(ctx: EventNotificationContext): Promise<void> {
  const { event } = ctx
  const recipients = await resolveEventRecipients(event)
  if (recipients.length === 0) return

  for (const userId of recipients) {
    try {
      await notificationService.send({
        userId,
        type: 'EVENT_REMINDER',
        title: `Evento cancelado: ${event.title}`,
        message: 'A escola cancelou este evento. Verifique no calendário.',
        actionUrl: '/responsavel/calendario',
        data: { eventId: event.id, change: 'cancelled' },
      })
    } catch (err) {
      logger.error(
        { err, userId, eventId: event.id },
        '[event-notification] falha ao notificar cancelamento'
      )
    }
  }
}

/**
 * Dispara notificação quando data ou local de um evento publicado muda.
 * Pula se a mudança não tem impacto pro responsável (ex: edição de descrição).
 */
export async function notifyEventRescheduled(
  ctx: EventNotificationContext & { changedFields: { date?: boolean; location?: boolean } }
): Promise<void> {
  const { event, changedFields } = ctx
  if (!changedFields.date && !changedFields.location) return

  const recipients = await resolveEventRecipients(event)
  if (recipients.length === 0) return

  const label =
    changedFields.date && changedFields.location
      ? 'Data e local alterados'
      : changedFields.date
        ? 'Data alterada'
        : 'Local alterado'

  for (const userId of recipients) {
    try {
      await notificationService.send({
        userId,
        type: 'EVENT_REMINDER',
        title: `${label}: ${event.title}`,
        message: 'Confira os novos detalhes no calendário do app.',
        actionUrl: '/responsavel/calendario',
        data: { eventId: event.id, change: 'rescheduled' },
      })
    } catch (err) {
      logger.error(
        { err, userId, eventId: event.id },
        '[event-notification] falha ao notificar reagendamento'
      )
    }
  }
}
