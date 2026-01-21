import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import { listInsuranceBillingsValidator } from '#validators/insurance'

export default class ListInsuranceBillingsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, status, startDate, endDate, page = 1, limit = 20 } =
      await request.validateUsing(listInsuranceBillingsValidator)

    const query = InsuranceBilling.query()
      .preload('school')
      .orderBy('period', 'desc')

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

    const formattedBillings = billings.all().map((billing) => ({
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
      school: {
        id: billing.school.id,
        name: billing.school.name,
      },
    }))

    return response.ok({
      data: formattedBillings,
      meta: {
        total: billings.total,
        page: billings.currentPage,
        lastPage: billings.lastPage,
        perPage: billings.perPage,
      },
    })
  }
}
