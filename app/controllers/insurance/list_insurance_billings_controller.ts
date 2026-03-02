import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import InsuranceBillingTransformer from '#transformers/insurance_billing_transformer'
import { listInsuranceBillingsValidator } from '#validators/insurance'

export default class ListInsuranceBillingsController {
  async handle({ request, serialize }: HttpContext) {
    const {
      schoolId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listInsuranceBillingsValidator)

    const query = InsuranceBilling.query().preload('school').orderBy('period', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (status) {
      query.where('status', status)
    }

    if (startDate) {
      query.where('period', '>=', startDate)
    }

    if (endDate) {
      query.where('period', '<=', endDate)
    }

    const billings = await query.paginate(page, limit)
    const data = billings.all()
    const metadata = billings.getMeta()

    return serialize(InsuranceBillingTransformer.paginate(data, metadata))
  }
}
