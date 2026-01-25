import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { getSchoolInsuranceClaimsValidator } from '#validators/insurance'

export default class GetSchoolInsuranceClaimsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      status,
      limit = 10,
    } = await request.validateUsing(getSchoolInsuranceClaimsValidator)

    const query = InsuranceClaim.query()
      .preload('studentPayment', (paymentQuery) => {
        paymentQuery.preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
      })
      .whereHas('studentPayment', (paymentQuery) => {
        paymentQuery.whereHas('student', (studentQuery) => {
          studentQuery.whereHas('user', (userQuery) => {
            userQuery.where('schoolId', schoolId)
          })
        })
      })
      .orderBy('claimDate', 'desc')
      .limit(limit)

    if (status) {
      query.where('status', status)
    }

    const claims = await query

    const formattedClaims = claims.map((claim) => ({
      id: claim.id,
      claimDate: claim.claimDate.toISODate(),
      overdueAmount: claim.overdueAmount,
      coveragePercentage: claim.coveragePercentage,
      coveredAmount: claim.coveredAmount,
      status: claim.status,
      approvedAt: claim.approvedAt?.toISO(),
      paidAt: claim.paidAt?.toISO(),
      rejectedAt: claim.rejectedAt?.toISO(),
      rejectionReason: claim.rejectionReason,
      student: {
        id: claim.studentPayment.student.id,
        name: claim.studentPayment.student.user.name,
      },
    }))

    return response.ok({
      data: formattedClaims,
    })
  }
}
