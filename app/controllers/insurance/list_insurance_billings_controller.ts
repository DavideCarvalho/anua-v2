import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import InsuranceBillingDto from '#models/dto/insurance_billing.dto'
import { listInsuranceBillingsValidator } from '#validators/insurance'

export default class ListInsuranceBillingsController {
  async handle({ request }: HttpContext) {
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

    return InsuranceBillingDto.fromPaginator(billings)
  }
}
