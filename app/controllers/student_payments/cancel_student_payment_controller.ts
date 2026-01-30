import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { cancelStudentPaymentValidator } from '#validators/student_payment'

export default class CancelStudentPaymentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(cancelStudentPaymentValidator)

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelReason: payload.reason,
      cancelledAt: new Date().toISOString(),
    }
    await payment.save()

    await payment.load('student')

    return response.ok(payment)
  }
}
