import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getFunnelStatsValidator } from '#validators/analytics'

export default class GetEnrollmentFunnelStatsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, academicPeriodId } = await request.validateUsing(getFunnelStatsValidator)

    let schoolFilter = ''
    let periodFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    }

    if (academicPeriodId) {
      periodFilter = 'AND shl."academicPeriodId" = :academicPeriodId'
      params.academicPeriodId = academicPeriodId
    }

    const [funnelResult] = await Promise.all([
      db.rawQuery(
        `
        SELECT
          COUNT(DISTINCT shl.id) as total_enrollments,
          COUNT(DISTINCT CASE WHEN st."enrollmentStatus" = 'PENDING_DOCUMENT_REVIEW' THEN shl.id END) as pending_documents,
          COUNT(DISTINCT CASE WHEN st."enrollmentStatus" = 'REGISTERED' THEN shl.id END) as completed,
          COUNT(DISTINCT CASE WHEN shl."docusealSignatureStatus" = 'PENDING' THEN shl.id END) as pending_signatures,
          COUNT(DISTINCT CASE WHEN shl."docusealSignatureStatus" = 'SIGNED' THEN shl.id END) as signed_contracts,
          COUNT(DISTINCT CASE WHEN shl."docusealSignatureStatus" = 'DECLINED' THEN shl.id END) as declined_signatures,
          COUNT(DISTINCT CASE WHEN shl."docusealSignatureStatus" = 'EXPIRED' THEN shl.id END) as expired_signatures
        FROM "StudentHasLevel" shl
        JOIN "Student" st ON shl."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE u."deletedAt" IS NULL
        ${schoolFilter}
        ${periodFilter}
        `,
        params
      ),
    ])

    const row = funnelResult.rows[0] || {}
    const totalEnrollments = Number(row.total_enrollments || 0)
    const pendingDocuments = Number(row.pending_documents || 0)
    const completed = Number(row.completed || 0)
    const pendingSignatures = Number(row.pending_signatures || 0)
    const signedContracts = Number(row.signed_contracts || 0)
    const declinedSignatures = Number(row.declined_signatures || 0)
    const expiredSignatures = Number(row.expired_signatures || 0)

    // Calculate rates
    const conversionRate =
      totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100 * 10) / 10 : 0
    const dropOffRate =
      totalEnrollments > 0
        ? Math.round(((totalEnrollments - completed) / totalEnrollments) * 100 * 10) / 10
        : 0
    const signatureCompletionRate =
      pendingSignatures + signedContracts > 0
        ? Math.round((signedContracts / (pendingSignatures + signedContracts)) * 100 * 10) / 10
        : 0

    return response.ok({
      totalEnrollments,
      pendingDocuments,
      completed,
      pendingSignatures,
      signedContracts,
      declinedSignatures,
      expiredSignatures,
      conversionRate,
      dropOffRate,
      signatureCompletionRate,
    })
  }
}
