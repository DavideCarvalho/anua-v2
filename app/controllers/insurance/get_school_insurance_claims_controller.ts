import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import { getSchoolInsuranceClaimsValidator } from '#validators/insurance'
import InsuranceClaimTransformer from '#transformers/insurance_claim_transformer'

export default class GetSchoolInsuranceClaimsController {
  async handle({ request, response, serialize }: HttpContext) {
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

    return response.ok(await serialize(InsuranceClaimTransformer.transform(claims)))
  }
}
