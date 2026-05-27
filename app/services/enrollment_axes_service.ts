import db from '@adonisjs/lucid/services/db'

/**
 * Cálculo dos 4 eixos de uma Matrícula (StudentHasLevel) a partir do banco.
 * Espelha a query agregada do `list_enrollments_controller.ts`, mas pra uma
 * única matrícula — feita pra ser usada por triggers (notificações, etc.)
 * que precisam saber "completou tudo?" depois de uma mudança de estado.
 *
 * Ver ADR-0001 e ADR-0005 pra contexto dos eixos.
 */

export type DocsAxisStatus = 'COMPLETE' | 'PENDING' | 'REJECTED'
export type SignatureAxisStatus =
  | 'PENDING'
  | 'PARTIALLY_SIGNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DECLINED'
  | 'NOT_APPLICABLE'
export type PaymentAxisStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'NOT_APPLICABLE'
export type ClassAxisStatus = 'ALLOCATED' | 'PENDING'

export interface AxesStatus {
  docs: {
    status: DocsAxisStatus
    approved: number
    rejected: number
    pending: number
    required: number
    lastUpdatedAt: string | null
  }
  signature: SignatureAxisStatus
  signatureLastUpdatedAt: string | null
  payment: PaymentAxisStatus
  paymentLastUpdatedAt: string | null
  classAllocation: ClassAxisStatus
  classAllocatedAt: string | null
  isComplete: boolean
}

function mapLegacySignatureStatus(legacy: string | null): SignatureAxisStatus {
  if (legacy === null) return 'NOT_APPLICABLE'
  switch (legacy) {
    case 'PENDING':
      return 'PENDING'
    case 'SIGNED':
      return 'COMPLETED'
    case 'DECLINED':
      return 'DECLINED'
    case 'EXPIRED':
      return 'CANCELLED'
    default:
      return 'PENDING'
  }
}

export async function computeAxesStatus(studentHasLevelId: string): Promise<AxesStatus | null> {
  const result = await db.rawQuery(
    `
    SELECT
      shl."docusealSignatureStatus" AS docuseal_signature_status,
      shl."classId" AS class_id,
      shl."updatedAt" AS shl_updated_at,
      COALESCE(docs.approved_count, 0) AS docs_approved,
      COALESCE(docs.rejected_count, 0) AS docs_rejected,
      COALESCE(docs.pending_count, 0) AS docs_pending,
      COALESCE(req.required_count, 0) AS docs_required,
      docs.last_doc_update AS docs_last_updated_at,
      sp."updatedAt" AS payment_last_updated_at,
      CASE
        WHEN c."enrollmentValue" IS NULL OR c."enrollmentValue" = 0 THEN 'NOT_APPLICABLE'
        WHEN sp.status = 'PAID' THEN 'PAID'
        WHEN c."enrollmentPaymentUntilDays" IS NOT NULL
          AND (shl."createdAt" + (c."enrollmentPaymentUntilDays" || ' days')::interval) < NOW()
          THEN 'OVERDUE'
        ELSE 'PENDING'
      END AS payment_status
    FROM "StudentHasLevel" shl
    LEFT JOIN "Contract" c ON c.id = shl."contractId"
    LEFT JOIN "StudentPayment" sp ON sp.id = shl."enrollmentPaymentId"
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) FILTER (WHERE sds.status = 'APPROVED') AS approved_count,
        COUNT(*) FILTER (WHERE sds.status = 'REJECTED') AS rejected_count,
        COUNT(*) FILTER (WHERE sds.status = 'PENDING') AS pending_count,
        MAX(sds."updatedAt") AS last_doc_update
      FROM "StudentDocumentSubmission" sds
      WHERE sds."studentId" = shl."studentId"
    ) docs ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS required_count
      FROM "ContractDocument" cd
      WHERE cd."contractId" = shl."contractId" AND cd.required = true
    ) req ON true
    WHERE shl.id = :id AND shl."deletedAt" IS NULL
    `,
    { id: studentHasLevelId }
  )

  const row = result.rows[0] as
    | {
        docuseal_signature_status: string | null
        class_id: string | null
        shl_updated_at: string | null
        docs_approved: string | number | null
        docs_rejected: string | number | null
        docs_pending: string | number | null
        docs_required: string | number | null
        docs_last_updated_at: string | null
        payment_last_updated_at: string | null
        payment_status: PaymentAxisStatus
      }
    | undefined

  if (!row) return null

  const approved = Number(row.docs_approved ?? 0)
  const rejected = Number(row.docs_rejected ?? 0)
  const pending = Number(row.docs_pending ?? 0)
  const required = Number(row.docs_required ?? 0)

  let docsStatus: DocsAxisStatus
  if (rejected > 0) docsStatus = 'REJECTED'
  else if (required === 0 || approved >= required) docsStatus = 'COMPLETE'
  else docsStatus = 'PENDING'

  const signature = mapLegacySignatureStatus(row.docuseal_signature_status)
  const payment = row.payment_status
  const classAllocation: ClassAxisStatus = row.class_id ? 'ALLOCATED' : 'PENDING'

  const docsOk = docsStatus === 'COMPLETE'
  const sigOk = signature === 'COMPLETED' || signature === 'NOT_APPLICABLE'
  const payOk = payment === 'PAID' || payment === 'NOT_APPLICABLE'
  const classOk = classAllocation === 'ALLOCATED'

  return {
    docs: {
      status: docsStatus,
      approved,
      rejected,
      pending,
      required,
      lastUpdatedAt: row.docs_last_updated_at ?? null,
    },
    signature,
    signatureLastUpdatedAt: row.shl_updated_at ?? null,
    payment,
    paymentLastUpdatedAt: row.payment_last_updated_at ?? null,
    classAllocation,
    classAllocatedAt: classAllocation === 'ALLOCATED' ? (row.shl_updated_at ?? null) : null,
    isComplete: docsOk && sigOk && payOk && classOk,
  }
}
