import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { listInsuranceClaimsValidator } from '#validators/insurance'

export default class ListInsuranceClaimsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, status, startDate, endDate, page = 1, limit = 20 } =
      await request.validateUsing(listInsuranceClaimsValidator)

    const query = InsuranceClaim.query()
      .preload('studentPayment', (paymentQuery) => {
        paymentQuery.preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
      })
      .preload('approvedByUser')
      .preload('rejectedByUser')
      .orderBy('claimDate', 'desc')

    if (schoolId) {
      query.whereHas('studentPayment', (paymentQuery) => {
        paymentQuery.whereHas('student', (studentQuery) => {
          studentQuery.whereHas('user', (userQuery) => {
            userQuery.whereHas('userHasSchools', (schoolQuery) => {
              schoolQuery.where('schoolId', schoolId)
            })
          })
        })
      })
    }

    if (status) {
      query.where('status', status)
    }

    if (startDate) {
      query.where('claimDate', '>=', startDate)
    }

    if (endDate) {
      query.where('claimDate', '<=', endDate)
    }

    const claims = await query.paginate(page, limit)

    const formattedClaims = claims.all().map((claim) => ({
      id: claim.id,
      claimDate: claim.claimDate.toISODate(),
      overdueAmount: claim.overdueAmount,
      coveragePercentage: claim.coveragePercentage,
      coveredAmount: claim.coveredAmount,
      status: claim.status,
      approvedAt: claim.approvedAt?.toISO(),
      approvedBy: claim.approvedByUser
        ? { id: claim.approvedByUser.id, name: claim.approvedByUser.name }
        : null,
      paidAt: claim.paidAt?.toISO(),
      rejectedAt: claim.rejectedAt?.toISO(),
      rejectedBy: claim.rejectedByUser
        ? { id: claim.rejectedByUser.id, name: claim.rejectedByUser.name }
        : null,
      rejectionReason: claim.rejectionReason,
      notes: claim.notes,
      studentPayment: {
        id: claim.studentPayment.id,
        amount: claim.studentPayment.amount,
        dueDate: claim.studentPayment.dueDate.toISODate(),
        student: {
          id: claim.studentPayment.student.id,
          name: claim.studentPayment.student.user.name,
          email: claim.studentPayment.student.user.email,
        },
      },
    }))

    return response.ok({
      data: formattedClaims,
      meta: {
        total: claims.total,
        page: claims.currentPage,
        lastPage: claims.lastPage,
        perPage: claims.perPage,
      },
    })
  }
}
