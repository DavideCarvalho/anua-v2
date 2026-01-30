import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import { markPaymentAsPaidValidator } from '#validators/student_payment'

export default class MarkPaymentAsPaidController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(markPaymentAsPaidValidator)

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
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

    await payment.load('student')

    return response.ok(payment)
  }
}
