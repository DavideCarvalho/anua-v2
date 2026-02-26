import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import InsuranceClaimDto from '#models/dto/insurance_claim.dto'
import { listInsuranceClaimsValidator } from '#validators/insurance'

export default class ListInsuranceClaimsController {
  async handle({ request }: HttpContext) {
    const {
      schoolId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listInsuranceClaimsValidator)

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

    return InsuranceClaimDto.fromPaginator(claims)
  }
}
