import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { listInsuranceClaimsValidator } from '#validators/insurance'
import InsuranceClaimTransformer from '#transformers/insurance_claim_transformer'

export default class ListInsuranceClaimsController {
  async handle({ request, serialize }: HttpContext) {
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

    const data = claims.all()
    const metadata = claims.getMeta()
    return serialize(InsuranceClaimTransformer.paginate(data, metadata))
  }
}
