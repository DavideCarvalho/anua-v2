import type { HttpContext } from '@adonisjs/core/http'
import StudentDocumentSubmission from '#models/student_document_submission'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import { DateTime } from 'luxon'
import { updateDocumentStatusValidator } from '#validators/enrollment'
import AppException from '#exceptions/app_exception'
import StudentDocumentSubmissionTransformer from '#transformers/student_document_submission_transformer'
import { notificationService } from '#services/notification_service'
import { computeAxesStatus } from '#services/enrollment_axes_service'
import logger from '@adonisjs/core/services/logger'

/**
 * Resolve quais usuários (responsáveis + aluno se autorresponsável)
 * devem receber notificações pra um aluno específico.
 */
async function getNotificationRecipientUserIds(studentId: string): Promise<string[]> {
  const student = await Student.find(studentId)
  if (!student) return []

  const responsibles = await StudentHasResponsible.query()
    .where('studentId', studentId)
    .select(['responsibleId'])

  const ids = responsibles.map((r) => r.responsibleId)
  if (student.isSelfResponsible) ids.push(student.id)
  return Array.from(new Set(ids))
}

async function notifyAll(
  userIds: string[],
  payload: {
    type:
      | 'ENROLLMENT_DOCUMENT_REJECTED'
      | 'ENROLLMENT_DOCUMENT_APPROVED'
      | 'ENROLLMENT_ALL_DOCUMENTS_APPROVED'
      | 'ENROLLMENT_COMPLETED'
    title: string
    message: string
    actionUrl?: string
    data?: Record<string, unknown>
  }
) {
  await Promise.all(
    userIds.map((userId) =>
      notificationService.send({ userId, ...payload }).catch((err) => {
        logger.error({ err, userId, type: payload.type }, '[notify] falhou ao enviar notificação')
      })
    )
  )
}

export default class UpdateDocumentStatusController {
  async handle({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const { id } = params
    const { status, rejectionReason } = await request.validateUsing(updateDocumentStatusValidator)

    const submission = await StudentDocumentSubmission.query()
      .where('id', id)
      .preload('contractDocument')
      .first()
    if (!submission) {
      throw AppException.notFound('Documento não encontrado')
    }

    if (status === 'REJECTED' && !rejectionReason) {
      throw AppException.badRequest('Motivo da rejeição é obrigatório')
    }

    submission.status = status
    submission.reviewedBy = user.id
    submission.reviewedAt = DateTime.now()
    submission.rejectionReason = status === 'REJECTED' ? rejectionReason || null : null

    await submission.save()

    // Back-compat com `Student.enrollmentStatus` legado (ver ADR-0001).
    if (status === 'APPROVED') {
      const student = await Student.find(submission.studentId)
      if (student) {
        const pending = await StudentDocumentSubmission.query()
          .where('studentId', student.id)
          .whereIn('status', ['PENDING', 'REJECTED'])
          .count('* as count')

        const pendingCount = Number(pending[0].$extras.count || 0)
        if (pendingCount === 0) {
          student.enrollmentStatus = 'REGISTERED'
          await student.save()
        }
      }
    }

    // --- Notificações (ADR-0004) ---
    const recipients = await getNotificationRecipientUserIds(submission.studentId)
    const docName = submission.contractDocument?.name ?? 'Documento'

    if (status === 'REJECTED') {
      // Evento 2
      await notifyAll(recipients, {
        type: 'ENROLLMENT_DOCUMENT_REJECTED',
        title: `${docName} rejeitado`,
        message: rejectionReason
          ? `Seu ${docName.toLowerCase()} foi rejeitado: ${rejectionReason}. Acesse o portal pra reenviar.`
          : `Seu ${docName.toLowerCase()} foi rejeitado. Acesse o portal pra reenviar.`,
        actionUrl: `/responsavel/documentos`,
        data: { submissionId: submission.id, contractDocumentId: submission.contractDocumentId },
      })
    } else if (status === 'APPROVED') {
      // Evento 6 — doc aprovado (TODO batching futuro)
      await notifyAll(recipients, {
        type: 'ENROLLMENT_DOCUMENT_APPROVED',
        title: `${docName} aprovado`,
        message: `Seu ${docName.toLowerCase()} foi aprovado pela escola.`,
        actionUrl: `/responsavel/documentos`,
        data: { submissionId: submission.id },
      })

      // Evento 7 — se TODOS os docs requeridos estão aprovados, notifica eixo verde
      const allDocsCheck = await StudentDocumentSubmission.query()
        .where('studentId', submission.studentId)
        .whereIn('status', ['PENDING', 'REJECTED'])
        .count('* as count')
      const stillPending = Number(allDocsCheck[0].$extras.count || 0)

      if (stillPending === 0) {
        await notifyAll(recipients, {
          type: 'ENROLLMENT_ALL_DOCUMENTS_APPROVED',
          title: 'Documentação completa!',
          message: 'Todos os documentos da sua matrícula foram aprovados.',
          actionUrl: `/responsavel/documentos`,
        })

        // Evento 5 — se TODOS os eixos (não só docs) estão fechados, notifica matrícula completa
        const matricula = await StudentHasLevel.query()
          .where('studentId', submission.studentId)
          .orderBy('createdAt', 'desc')
          .first()
        if (matricula) {
          const axes = await computeAxesStatus(matricula.id)
          if (axes?.isComplete) {
            await notifyAll(recipients, {
              type: 'ENROLLMENT_COMPLETED',
              title: 'Matrícula completa!',
              message: 'Sua matrícula está pronta. Bem-vindo(a)!',
              actionUrl: `/responsavel/matricula/${matricula.id}`,
              data: { studentHasLevelId: matricula.id },
            })
          }
        }
      }
    }

    return response.ok(await serialize(StudentDocumentSubmissionTransformer.transform(submission)))
  }
}
