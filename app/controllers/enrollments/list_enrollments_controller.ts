import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { SimplePaginator } from '@adonisjs/lucid/database'
import { listEnrollmentsValidator } from '#validators/enrollment'
import EnrollmentWithAxesTransformer, {
  type DocsAxisStatus,
  type SignatureAxisStatus,
  type PaymentAxisStatus,
  type ClassAxisStatus,
  type EnrollmentRow,
} from '#transformers/enrollment_with_axes_transformer'

interface RawRow {
  id: string
  student_id: string
  student_name: string
  student_email: string | null
  level_id: string | null
  level_name: string | null
  academic_period_id: string | null
  academic_period_name: string | null
  scholarship_id: string | null
  scholarship_name: string | null
  scholarship_discount: number | null
  payment_method: string | null
  created_at: string
  docs_approved: string | number | null
  docs_rejected: string | number | null
  docs_pending: string | number | null
  docs_required: string | number | null
  docuseal_signature_status: string | null
  payment_status: PaymentAxisStatus
  class_allocated: boolean
}

/**
 * Mapeia o enum legado `DocusealSignatureStatus`
 * (`PENDING`|`SIGNED`|`DECLINED`|`EXPIRED`) pro enum interno normalizado.
 *
 * Quando ADR-0002 (signature provider abstraction) for escrito, este mapa some —
 * a coluna passa a ser `signature_status` com o enum interno direto.
 */
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

function computeDocsStatus(approved: number, rejected: number, required: number): DocsAxisStatus {
  if (rejected > 0) return 'REJECTED'
  if (required > 0 && approved >= required) return 'COMPLETE'
  return 'PENDING'
}

function isAxisDone(
  docs: DocsAxisStatus,
  signature: SignatureAxisStatus,
  payment: PaymentAxisStatus,
  classAllocation: ClassAxisStatus
): boolean {
  const docsOk = docs === 'COMPLETE'
  const sigOk = signature === 'COMPLETED' || signature === 'NOT_APPLICABLE'
  const payOk = payment === 'PAID' || payment === 'NOT_APPLICABLE'
  const classOk = classAllocation === 'ALLOCATED'
  return docsOk && sigOk && payOk && classOk
}

export default class ListEnrollmentsController {
  async handle({ request, serialize }: HttpContext) {
    const {
      schoolId,
      academicPeriodId,
      status: legacyStatusFilter,
      levelId,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listEnrollmentsValidator)

    const offset = (page - 1) * limit

    // Query agregada — uma linha por StudentHasLevel com os 4 eixos pré-computados.
    // Veja ADR-0001 pra contexto da decisão "agregar no read-side".
    const sql = `
      SELECT
        shl.id,
        shl."studentId" AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        shl."levelId" AS level_id,
        l.name AS level_name,
        shl."academicPeriodId" AS academic_period_id,
        ap.name AS academic_period_name,
        shl."scholarshipId" AS scholarship_id,
        sch.name AS scholarship_name,
        sch."discountPercentage" AS scholarship_discount,
        shl."paymentMethod" AS payment_method,
        shl."createdAt" AS created_at,
        shl."docusealSignatureStatus" AS docuseal_signature_status,
        COALESCE(docs.approved_count, 0) AS docs_approved,
        COALESCE(docs.rejected_count, 0) AS docs_rejected,
        COALESCE(docs.pending_count, 0) AS docs_pending,
        COALESCE(req.required_count, 0) AS docs_required,
        CASE
          WHEN c."enrollmentValue" IS NULL OR c."enrollmentValue" = 0 THEN 'NOT_APPLICABLE'
          WHEN sp.status = 'PAID' THEN 'PAID'
          WHEN c."enrollmentPaymentUntilDays" IS NOT NULL
            AND (shl."createdAt" + (c."enrollmentPaymentUntilDays" || ' days')::interval) < NOW()
            THEN 'OVERDUE'
          ELSE 'PENDING'
        END AS payment_status,
        (shl."classId" IS NOT NULL) AS class_allocated
      FROM "StudentHasLevel" shl
      JOIN "Student" s ON s.id = shl."studentId"
      JOIN "User" u ON u.id = s.id
      LEFT JOIN "Level" l ON l.id = shl."levelId"
      JOIN "AcademicPeriod" ap ON ap.id = shl."academicPeriodId"
      LEFT JOIN "Scholarship" sch ON sch.id = shl."scholarshipId"
      LEFT JOIN "Contract" c ON c.id = shl."contractId"
      LEFT JOIN "StudentPayment" sp ON sp.id = shl."enrollmentPaymentId"
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE sds.status = 'APPROVED') AS approved_count,
          COUNT(*) FILTER (WHERE sds.status = 'REJECTED') AS rejected_count,
          COUNT(*) FILTER (WHERE sds.status = 'PENDING') AS pending_count
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
        ${levelId ? 'AND shl."levelId" = :levelId' : ''}
      ORDER BY shl."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM "StudentHasLevel" shl
      JOIN "AcademicPeriod" ap ON ap.id = shl."academicPeriodId"
      WHERE ap."schoolId" = :schoolId
        AND shl."deletedAt" IS NULL
        ${academicPeriodId ? 'AND shl."academicPeriodId" = :academicPeriodId' : ''}
        ${levelId ? 'AND shl."levelId" = :levelId' : ''}
    `

    const bindings: Record<string, unknown> = { schoolId, limit, offset }
    if (academicPeriodId) bindings.academicPeriodId = academicPeriodId
    if (levelId) bindings.levelId = levelId

    const [rowsResult, countResult] = await Promise.all([
      db.rawQuery(sql, bindings),
      db.rawQuery(countSql, bindings),
    ])

    const rawRows = rowsResult.rows as RawRow[]
    const total = Number(countResult.rows[0]?.total ?? 0)

    let mapped: EnrollmentRow[] = rawRows.map((r) => {
      const approved = Number(r.docs_approved ?? 0)
      const rejected = Number(r.docs_rejected ?? 0)
      const pending = Number(r.docs_pending ?? 0)
      const required = Number(r.docs_required ?? 0)

      const docsStatus = computeDocsStatus(approved, rejected, required)
      const signatureStatus = mapLegacySignatureStatus(r.docuseal_signature_status)
      const paymentStatus = r.payment_status
      const classStatus: ClassAxisStatus = r.class_allocated ? 'ALLOCATED' : 'PENDING'

      return {
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentEmail: r.student_email,
        levelId: r.level_id,
        levelName: r.level_name,
        academicPeriodId: r.academic_period_id,
        academicPeriodName: r.academic_period_name,
        scholarshipId: r.scholarship_id,
        scholarshipName: r.scholarship_name,
        scholarshipDiscount:
          r.scholarship_discount !== null ? Number(r.scholarship_discount) : null,
        paymentMethod: r.payment_method,
        createdAt: new Date(r.created_at).toISOString(),
        axes: {
          docs: { status: docsStatus, approved, rejected, pending, required },
          signature: { status: signatureStatus },
          payment: { status: paymentStatus },
          classAllocation: { status: classStatus },
        },
        isComplete: isAxisDone(docsStatus, signatureStatus, paymentStatus, classStatus),
      }
    })

    // Back-compat com o filtro legado de status binário (PENDING_DOCUMENT_REVIEW/REGISTERED):
    // mapeia REGISTERED → isComplete=true, PENDING_DOCUMENT_REVIEW → isComplete=false.
    // Filtro acontece após agregação porque depende dos 4 eixos derivados.
    if (legacyStatusFilter === 'REGISTERED') {
      mapped = mapped.filter((r) => r.isComplete)
    } else if (legacyStatusFilter === 'PENDING_DOCUMENT_REVIEW') {
      mapped = mapped.filter((r) => !r.isComplete)
    }

    // Reusa o paginator da Lucid pra obter o shape de meta esperado pelo
    // transformer (firstPageUrl, nextPageUrl, etc.) — não dá pra usar
    // `.paginate()` direto porque a query é raw SQL com LATERAL JOIN.
    const paginator = new SimplePaginator(total, limit, page, ...mapped)

    return serialize(EnrollmentWithAxesTransformer.paginate(paginator.all(), paginator.getMeta()))
  }
}
