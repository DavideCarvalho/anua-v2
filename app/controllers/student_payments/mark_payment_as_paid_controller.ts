import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import CanteenPurchase from '#models/canteen_purchase'
import { markPaymentAsPaidValidator } from '#validators/student_payment'
import AppException from '#exceptions/app_exception'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class MarkPaymentAsPaidController {
  async handle({ params, request, response, selectedSchoolIds, serialize }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(markPaymentAsPaidValidator)

    const payment = await StudentPayment.query()
      .where('id', id)
      .whereHas('student', (studentQuery) => {
        studentQuery.whereHas('class', (classQuery) => {
          classQuery.whereIn('schoolId', selectedSchoolIds ?? [])
        })
      })
      .first()

    if (!payment) {
      throw AppException.notFound('Pagamento do aluno não encontrado')
    }

    payment.status = 'PAID'
    payment.paidAt = payload.paidAt ? DateTime.fromJSDate(payload.paidAt) : DateTime.now()

    if (payload.paymentGatewayId) {
      payment.paymentGatewayId = payload.paymentGatewayId
    }

    if (payload.paymentGateway) {
      payment.paymentGateway = payload.paymentGateway
    }

    const metadata: Record<string, unknown> = { ...(payment.metadata || {}) }
    if (payload.paymentMethod) metadata.paymentMethod = payload.paymentMethod
    if (payload.amountPaid) metadata.amountPaid = payload.amountPaid
    if (payload.observation) metadata.observation = payload.observation
    payment.metadata = metadata

    await payment.save()

    if (payment.type === 'CANTEEN') {
      const purchase = await CanteenPurchase.query()
        .where('studentPaymentId', payment.id)
        .whereNot('status', 'CANCELLED')
        .first()

      if (purchase) {
        purchase.status = 'PAID'
        purchase.paidAt = payment.paidAt ?? DateTime.now()
        await purchase.save()
      }
    }

    await payment.load('student')

    return response.ok(await serialize(StudentPaymentTransformer.transform(payment)))
  }
}
