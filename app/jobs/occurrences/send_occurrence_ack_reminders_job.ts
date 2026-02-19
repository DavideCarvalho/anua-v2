import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import Notification from '#models/notification'
import OccurrenceAckRequiredMail from '#mails/occurrence_ack_required_mail'

interface SendOccurrenceAckRemindersPayload {}

interface PendingReminderRow {
  userId: string
  responsibleName: string | null
  email: string | null
  occurrenceId: string
  occurrenceType: string
  occurrenceText: string
  occurrenceDate: string
  studentName: string
  actionUrl: string | null
  lastTouchAt: string
}

function businessDaysBetween(from: DateTime, to: DateTime): number {
  let cursor = from.startOf('day').plus({ days: 1 })
  const end = to.startOf('day')
  let count = 0

  while (cursor <= end) {
    if (cursor.weekday <= 5) {
      count += 1
    }
    cursor = cursor.plus({ days: 1 })
  }

  return count
}

export default class SendOccurrenceAckRemindersJob extends Job<SendOccurrenceAckRemindersPayload> {
  static readonly jobName = 'SendOccurrenceAckRemindersJob'

  static options = {
    queue: 'notifications',
    maxRetries: 3,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const now = DateTime.now()

    const pendingResult = await db.rawQuery<{ rows: PendingReminderRow[] }>(
      `
        SELECT
          n."userId" as "userId",
          u.name as "responsibleName",
          u.email as email,
          o.id as "occurrenceId",
          o.type as "occurrenceType",
          o.text as "occurrenceText",
          to_char(o.date, 'DD/MM/YYYY') as "occurrenceDate",
          student_user.name as "studentName",
          n."actionUrl" as "actionUrl",
          COALESCE(MAX(reminder."createdAt"), n."createdAt")::text as "lastTouchAt"
        FROM "Notification" n
        JOIN "User" u ON u.id = n."userId"
        JOIN "Occurence" o ON o.id = n.data->>'occurrenceId'
        JOIN "Student" s ON s.id = o."studentId"
        JOIN "User" student_user ON student_user.id = s.id
        LEFT JOIN "ResponsibleUserAcceptedOccurence" ack
          ON ack."occurenceId" = o.id
          AND ack."responsibleUserId" = n."userId"
        LEFT JOIN "Notification" reminder
          ON reminder."userId" = n."userId"
          AND reminder.data->>'kind' = 'occurrence_ack_reminder'
          AND reminder.data->>'occurrenceId' = o.id
        WHERE n.data->>'kind' = 'occurrence_created'
          AND o.type <> 'PRAISE'
          AND ack.id IS NULL
          AND u."deletedAt" IS NULL
          AND student_user."deletedAt" IS NULL
          AND u.email IS NOT NULL
        GROUP BY
          n."userId",
          u.name,
          u.email,
          o.id,
          o.type,
          o.text,
          o.date,
          student_user.name,
          n."actionUrl",
          n."createdAt"
      `
    )

    const typeLabels: Record<string, string> = {
      BEHAVIOR: 'Comportamento',
      PERFORMANCE: 'Desempenho',
      ABSENCE: 'Falta',
      LATE: 'Atraso',
      OTHER: 'Outro',
    }

    for (const row of pendingResult.rows) {
      const lastTouchAt = DateTime.fromISO(row.lastTouchAt)
      if (!lastTouchAt.isValid) {
        continue
      }

      const days = businessDaysBetween(lastTouchAt, now)
      if (days < 5) {
        continue
      }

      const actionUrl = row.actionUrl || '/responsavel/registro-diario'
      const recipientEmail = row.email?.trim()
      if (!recipientEmail) {
        continue
      }

      try {
        await mail.send(
          new OccurrenceAckRequiredMail({
            to: recipientEmail,
            responsibleName: row.responsibleName || 'Responsavel',
            studentName: row.studentName,
            occurrenceTypeLabel: typeLabels[row.occurrenceType] ?? row.occurrenceType,
            occurrenceText: row.occurrenceText,
            occurrenceDate: row.occurrenceDate,
            actionUrl,
            isReminder: true,
          })
        )

        await Notification.create({
          userId: row.userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Lembrete de registro diario pendente',
          message: `Voce possui um registro diario pendente de reconhecimento para ${row.studentName}.`,
          data: {
            occurrenceId: row.occurrenceId,
            kind: 'occurrence_ack_reminder',
          },
          isRead: false,
          sentViaInApp: true,
          sentViaEmail: true,
          sentViaPush: false,
          sentViaSms: false,
          sentViaWhatsApp: false,
          emailSentAt: now,
          actionUrl,
        })
      } catch (error) {
        await Notification.query()
          .where('userId', row.userId)
          .whereRaw(`data->>'kind' = 'occurrence_created'`)
          .whereRaw(`data->>'occurrenceId' = ?`, [row.occurrenceId])
          .update({
            emailError:
              error instanceof Error ? error.message : 'Falha ao enviar email de lembrete',
          })
      }
    }
  }
}
