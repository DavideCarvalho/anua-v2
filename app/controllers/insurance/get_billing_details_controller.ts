import type { HttpContext } from '@adonisjs/core/http'
import InsuranceBilling from '#models/insurance_billing'
import { getBillingDetailsValidator } from '#validators/insurance'
import AppException from '#exceptions/app_exception'

export default class GetBillingDetailsController {
  async handle({ request, response }: HttpContext) {
    const { billingId } = await request.validateUsing(getBillingDetailsValidator)

    const billing = await InsuranceBilling.query()
      .where('id', billingId)
      .preload('school')
      .preload('studentPayments', (paymentQuery) => {
        paymentQuery.preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
      })
      .first()

    if (!billing) {
      throw AppException.notFound('Faturamento não encontrado')
    }

    return response.ok({
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
      paymentGatewayId: billing.paymentGatewayId,
      notes: billing.notes,
      school: {
        id: billing.school.id,
        name: billing.school.name,
      },
      studentPayments: billing.studentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        month: payment.month,
        year: payment.year,
        dueDate: payment.dueDate.toISODate(),
        status: payment.status,
        student: {
          id: payment.student.id,
          name: payment.student.user.name,
        },
      })),
    })
  }
}
