import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import InsuranceBillingDto from '#models/dto/insurance_billing.dto'
import { getSchoolInsuranceBillingsValidator } from '#validators/insurance'

export default class GetSchoolInsuranceBillingsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, limit = 10 } = await request.validateUsing(
      getSchoolInsuranceBillingsValidator
    )

    const billings = await InsuranceBilling.query()
      .where('schoolId', schoolId)
      .orderBy('period', 'desc')
      .limit(limit)

    return response.ok(InsuranceBillingDto.fromArray(billings))
  }
}
