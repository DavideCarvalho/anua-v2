import { Job } from '@adonisjs/queue'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import StudentHasLevel from '#models/student_has_level'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import { computeAxesStatus } from '#services/enrollment_axes_service'
import { notificationService } from '#services/notification_service'

interface SendEnrollmentRemindersPayload {}

/**
 * Evento 4 (ADR-0004): lembrete pra matrículas paradas.
 *
 * Roda diariamente. Pra cada Matrícula:
 *   - Criada há mais de 3 dias
 *   - Tem algum eixo não-completo (computeAxesStatus)
 *   - Não recebeu reminder nos últimos 7 dias (anti-flood)
 * → dispara ENROLLMENT_REMINDER pros responsáveis (ou aluno autorresponsável).
 *
 * Não envia se eixo Pagamento `OVERDUE` é o único atrito — esse caso é coberto
 * pelo módulo financeiro (que já dispara seus próprios lembretes de cobrança).
 */
export default class SendEnrollmentRemindersJob extends Job<SendEnrollmentRemindersPayload> {
  static readonly jobName = 'SendEnrollmentRemindersJob'

  static options = {
    queue: 'notifications',
    maxRetries: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    const now = DateTime.now()
    const cutoffDate = now.minus({ days: 3 })
    const reminderWindow = now.minus({ days: 7 })

    // Pega matrículas candidatas: criadas há +3 dias, não deletadas
    const matriculas = await StudentHasLevel.query()
      .where('createdAt', '<', cutoffDate.toSQL()!)
      .whereNull('deletedAt')

    let dispatched = 0
    let skipped = 0

    for (const matricula of matriculas) {
      const axes = await computeAxesStatus(matricula.id)
      if (!axes || axes.isComplete) {
        skipped++
        continue
      }

      // Se a única pendência é pagamento OVERDUE, deixa pro módulo financeiro
      const onlyOverduePayment =
        axes.docs.status === 'COMPLETE' &&
        (axes.signature === 'COMPLETED' || axes.signature === 'NOT_APPLICABLE') &&
        axes.payment === 'OVERDUE' &&
        axes.classAllocation === 'ALLOCATED'
      if (onlyOverduePayment) {
        skipped++
        continue
      }

      const student = await Student.find(matricula.studentId)
      if (!student) continue

      const responsibles = await StudentHasResponsible.query()
        .where('studentId', matricula.studentId)
        .select(['responsibleId'])

      const recipientIds = responsibles.map((r) => r.responsibleId)
      if (student.isSelfResponsible) recipientIds.push(student.id)

      // Anti-flood: pula recipient que recebeu reminder dessa matrícula nos últimos 7 dias
      const recentReminders = await Notification.query()
        .where('type', 'ENROLLMENT_REMINDER')
        .where('createdAt', '>=', reminderWindow.toSQL()!)
        .whereIn('userId', recipientIds)
        .whereRaw(`data->>'studentHasLevelId' = ?`, [matricula.id])
        .select(['userId'])

      const recentRecipientIds = new Set(recentReminders.map((n) => n.userId))
      const toNotify = recipientIds.filter((id) => !recentRecipientIds.has(id))

      if (toNotify.length === 0) {
        skipped++
        continue
      }

      const pendingLabels: string[] = []
      if (axes.docs.status !== 'COMPLETE') {
        pendingLabels.push(
          axes.docs.status === 'REJECTED'
            ? 'documento rejeitado pra reenviar'
            : `${Math.max(0, axes.docs.required - axes.docs.approved)} documento(s) faltando`
        )
      }
      if (axes.signature !== 'COMPLETED' && axes.signature !== 'NOT_APPLICABLE') {
        pendingLabels.push('contrato pra assinar')
      }
      if (axes.payment === 'PENDING' || axes.payment === 'OVERDUE') {
        pendingLabels.push(
          axes.payment === 'OVERDUE' ? 'taxa de matrícula atrasada' : 'taxa de matrícula pendente'
        )
      }

      const message = `Sua matrícula ainda tem pendências: ${pendingLabels.join(', ')}. Acesse o portal pra resolver.`

      for (const userId of toNotify) {
        try {
          await notificationService.send({
            userId,
            type: 'ENROLLMENT_REMINDER',
            title: 'Sua matrícula está aguardando você',
            message,
            actionUrl: `/responsavel/matricula/${matricula.id}`,
            data: { studentHasLevelId: matricula.id, pendingLabels },
          })
          dispatched++
        } catch (err) {
          logger.error({ err, userId }, '[enrollment-reminder] falha ao enviar')
        }
      }
    }

    logger.info({ dispatched, skipped, total: matriculas.length }, '[enrollment-reminder] done')
  }
}
