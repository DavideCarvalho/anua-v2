import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import { getSchoolInsuranceBillingsValidator } from '#validators/insurance'

export default class GetSchoolInsuranceBillingsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, limit = 10 } = await request.validateUsing(getSchoolInsuranceBillingsValidator)

    const billings = await InsuranceBilling.query()
      .where('schoolId', schoolId)
      .orderBy('period', 'desc')
      .limit(limit)

    const formattedBillings = billings.map((billing) => ({
      id: billing.id,
      period: billing.period.toISODate(),
      insuredStudentsCount: billing.insuredStudentsCount,
      averageTuition: billing.averageTuition,
      insurancePercentage: billing.insurancePercentage,
      totalAmount: billing.totalAmount,
      status: billing.status,
      dueDate: billing.dueDate.toISODate(),
      paidAt: billing.paidAt?.toISO(),
      invoiceUrl: billing.invoiceUrl,
    }))

    return response.ok({
      data: formattedBillings,
    })
  }
}
