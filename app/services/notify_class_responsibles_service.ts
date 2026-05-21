import logger from '@adonisjs/core/services/logger'
import { type DateTime } from 'luxon'

import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import { notificationService } from '#services/notification_service'
import type { NotificationType } from '#models/notification'

interface NotifyClassResponsiblesParams {
  classId: string
  type: Extract<NotificationType, 'EXAM_SCHEDULED' | 'ASSIGNMENT_CREATED'>
  title: string
  message: string
  actionUrl?: string
  data?: Record<string, unknown>
}

/**
 * Dispara notificação in-app + canais habilitados pra todos os responsáveis
 * com acesso pedagógico dos alunos da turma. Fire-and-forget: erro num
 * responsável não impede o resto. Não joga exceção pra fora.
 */
export async function notifyClassResponsibles(params: NotifyClassResponsiblesParams) {
  const { classId, type, title, message, actionUrl, data } = params

  try {
    const students = await Student.query().where('classId', classId).select('id')
    if (students.length === 0) return

    const responsibleLinks = await StudentHasResponsible.query()
      .whereIn(
        'studentId',
        students.map((s) => s.id)
      )
      .where('isPedagogical', true)

    const uniqueResponsibleIds = Array.from(new Set(responsibleLinks.map((r) => r.responsibleId)))

    const results = await Promise.allSettled(
      uniqueResponsibleIds.map((userId) =>
        notificationService.send({
          userId,
          type,
          title,
          message,
          data,
          actionUrl,
        })
      )
    )

    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed > 0) {
      logger.warn(
        { classId, type, failed, total: uniqueResponsibleIds.length },
        'Some class-responsible notifications failed'
      )
    }
  } catch (err) {
    logger.error({ err, classId, type }, 'notifyClassResponsibles failed to dispatch')
  }
}

const BR_TZ = 'America/Sao_Paulo'

// Form de criar prova só captura dia (sem hora), então a notificação nunca
// mostra horário — evita confundir mãe com "às 03:00" vindo do timezone.
export function formatExamDate(d: DateTime): string {
  return d.setZone(BR_TZ).setLocale('pt-BR').toFormat('dd/LL')
}

export function formatAssignmentDate(d: DateTime): string {
  return d.setZone(BR_TZ).setLocale('pt-BR').toFormat('dd/LL/yyyy')
}
