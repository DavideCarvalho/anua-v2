import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import School from '#models/school'
import AppException from '#exceptions/app_exception'

const queryValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
    academicPeriodId: vine.string().optional(),
  })
)

interface CountRow {
  needs_offline_signature: string | number
  needs_class_allocation: string | number
  waiting_document_resubmit: string | number
  enrollments_with_fee_pending: string | number
}

/**
 * Conta as pendências de ação por categoria pra uma escola num período letivo
 * (opcional). Alimenta o banner "ação requerida" no topo de /escola/matriculas
 * — matrícula é funil de dinheiro, então a equipe precisa enxergar essas
 * pendências de fora pra dentro, sem ter que escanear a tabela linha a linha.
 *
 * Categorias:
 * - needsOfflineSignature: matrículas com docs aprovados e sem provider de
 *   assinatura online (todas hoje, enquanto ADR-0002 não chega). A escola
 *   precisa marcar a assinatura presencial.
 * - needsClassAllocation: matrículas há mais de 3 dias sem turma alocada.
 * - waitingDocumentResubmit: matrículas com docs rejeitados aguardando o
 *   responsável reenviar — informativo, ação dele e não da escola.
 * - enrollmentsWithFeePending: matrículas com taxa > 0 e sem cobrança paga,
 *   somente relevante se a escola ainda não tem gateway online ativo
 *   (paymentConfigStatus !== 'ACTIVE'): "você precisa cobrar essa galera".
 */
export default class GetActionCountsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, academicPeriodId } = await request.validateUsing(queryValidator)

    const school = await School.find(schoolId)
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const result = await db.rawQuery(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE shl."signatureStatus" IS NULL
            AND COALESCE(docs.approved_count, 0) >= COALESCE(req.required_count, 0)
            AND COALESCE(req.required_count, 0) > 0
        ) AS needs_offline_signature,

        COUNT(*) FILTER (
          WHERE shl."classId" IS NULL
            AND shl."createdAt" < NOW() - INTERVAL '3 days'
        ) AS needs_class_allocation,

        COUNT(*) FILTER (
          WHERE COALESCE(docs.rejected_count, 0) > 0
        ) AS waiting_document_resubmit,

        COUNT(*) FILTER (
          WHERE c."enrollmentValue" > 0
            AND (sp.status IS NULL OR sp.status != 'PAID')
        ) AS enrollments_with_fee_pending
      FROM "StudentHasLevel" shl
      JOIN "AcademicPeriod" ap ON ap.id = shl."academicPeriodId"
      LEFT JOIN "Contract" c ON c.id = shl."contractId"
      LEFT JOIN "StudentPayment" sp ON sp.id = shl."enrollmentPaymentId"
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE sds.status = 'APPROVED') AS approved_count,
          COUNT(*) FILTER (WHERE sds.status = 'REJECTED') AS rejected_count
        FROM "StudentDocumentSubmission" sds
        WHERE sds."studentId" = shl."studentId"
      ) docs ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS required_count
        FROM "ContractDocument" cd
        WHERE cd."contractId" = shl."contractId" AND cd.required = true
      ) req ON true
      WHERE ap."schoolId" = :schoolId
        AND shl."deletedAt" IS NULL
        ${academicPeriodId ? 'AND shl."academicPeriodId" = :academicPeriodId' : ''}
      `,
      { schoolId, ...(academicPeriodId ? { academicPeriodId } : {}) }
    )

    const row = (result.rows?.[0] as CountRow | undefined) ?? {
      needs_offline_signature: 0,
      needs_class_allocation: 0,
      waiting_document_resubmit: 0,
      enrollments_with_fee_pending: 0,
    }

    const hasOnlinePayment = school.paymentConfigStatus === 'ACTIVE'
    const feePending = Number(row.enrollments_with_fee_pending ?? 0)

    return response.ok({
      paymentConfigStatus: school.paymentConfigStatus,
      hasOnlinePayment,
      counts: {
        needsOfflineSignature: Number(row.needs_offline_signature ?? 0),
        needsClassAllocation: Number(row.needs_class_allocation ?? 0),
        waitingDocumentResubmit: Number(row.waiting_document_resubmit ?? 0),
        // Só faz sentido como pendência se a escola não tem pgto online:
        // se tem gateway ativo, as cobranças saem automáticas via scheduler.
        needsManualPaymentCollection: hasOnlinePayment ? 0 : feePending,
      },
    })
  }
}
