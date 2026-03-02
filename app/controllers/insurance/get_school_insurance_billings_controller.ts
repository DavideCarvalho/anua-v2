import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import InsuranceBillingTransformer from '#transformers/insurance_billing_transformer'
import { getSchoolInsuranceBillingsValidator } from '#validators/insurance'

export default class GetSchoolInsuranceBillingsController {
  async handle({ request, serialize }: HttpContext) {
    const { schoolId, limit = 10 } = await request.validateUsing(
      getSchoolInsuranceBillingsValidator
    )

    const billings = await InsuranceBilling.query()
      .where('schoolId', schoolId)
      .preload('school')
      .orderBy('period', 'desc')
      .limit(limit)

    return serialize(InsuranceBillingTransformer.transform(billings))
  }
}
