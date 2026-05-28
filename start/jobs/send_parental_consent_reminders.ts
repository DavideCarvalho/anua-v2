import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

import EventParentalConsent from '#models/event_parental_consent'
import { notificationService } from '#services/notification_service'

const BR_TZ = 'America/Sao_Paulo'

// Janela em dias antes do evento em que disparamos lembrete.
// Lembrete D-3 dá tempo pra responsável assinar antes do D-1 (digest) e D-0
// (push). Eventos passados ou já com status diferente de PENDING são pulados.
const REMINDER_WINDOW_DAYS = 3

interface ConsentReminderStats {
  consentsProcessed: number
  remindersSent: number
  remindersSkipped: number
  remindersFailed: number
}

interface ConsentReminderPayload {
  dryRun?: boolean
}

/**
 * Lembrete D-3 pra autorizações parentais pendentes. Roda 1x por dia (10h BR).
 *
 * Critério: status=PENDING, evento começa em ≤ 3 dias, e ou nunca recebeu
 * lembrete ou último lembrete foi > 24h atrás.
 *
 * Aplica throttle no service NotificationService — push + email + WhatsApp
 * + in-app, respeitando preferências do destinatário.
 */
export async function sendParentalConsentReminders(
  payload: ConsentReminderPayload = {}
): Promise<ConsentReminderStats> {
  const { dryRun = false } = payload
  const stats: ConsentReminderStats = {
    consentsProcessed: 0,
    remindersSent: 0,
    remindersSkipped: 0,
    remindersFailed: 0,
  }

  const now = DateTime.now()
  const nowBr = now.setZone(BR_TZ)
  const todayStartBr = nowBr.startOf('day')
  const windowEndBr = todayStartBr.plus({ days: REMINDER_WINDOW_DAYS }).endOf('day')

  const consents = await EventParentalConsent.query()
    .where('status', 'PENDING')
    .preload('event')
    .preload('student', (q) => q.preload('user'))

  stats.consentsProcessed = consents.length
  const twentyFourHoursAgo = now.minus({ hours: 24 })

  for (const consent of consents) {
    const event = consent.event
    if (!event) {
      stats.remindersSkipped++
      continue
    }

    // Skip se o evento já passou, foi cancelado ou está fora da janela D-3.
    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      stats.remindersSkipped++
      continue
    }
    if (event.startDate < todayStartBr.toUTC() || event.startDate > windowEndBr.toUTC()) {
      stats.remindersSkipped++
      continue
    }

    // Anti-spam: 1 lembrete a cada 24h por consent.
    if (consent.reminderSentAt && consent.reminderSentAt > twentyFourHoursAgo) {
      stats.remindersSkipped++
      continue
    }

    const studentName = consent.student?.user?.name ?? 'seu filho'
    const daysUntil = Math.max(
      0,
      Math.ceil(event.startDate.diff(now, 'days').days)
    )
    const whenLabel =
      daysUntil === 0
        ? 'hoje'
        : daysUntil === 1
          ? 'amanhã'
          : `em ${daysUntil} dias`

    if (dryRun) {
      logger.info(
        {
          consentId: consent.id,
          eventId: event.id,
          responsibleId: consent.responsibleId,
          daysUntil,
        },
        '[parental-consent-reminders] dry-run'
      )
      stats.remindersSent++
      continue
    }

    try {
      await notificationService.send({
        userId: consent.responsibleId,
        type: 'EVENT_REMINDER',
        title: `Autorização pendente: ${event.title}`,
        message: `${studentName} ainda não tem autorização assinada pro evento que acontece ${whenLabel}.`,
        actionUrl: '/responsavel/autorizacoes',
        data: {
          eventId: event.id,
          consentId: consent.id,
          change: 'consent-reminder',
          daysUntil,
        },
      })

      consent.reminderSentAt = now
      consent.reminderCount = (consent.reminderCount ?? 0) + 1
      await consent.save()

      stats.remindersSent++
    } catch (err) {
      stats.remindersFailed++
      logger.error(
        { err, consentId: consent.id, eventId: event.id },
        '[parental-consent-reminders] falha ao notificar'
      )
    }
  }

  logger.info({ stats }, '[parental-consent-reminders] done')
  return stats
}
