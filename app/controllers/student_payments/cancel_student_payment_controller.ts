import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'

export default class CancelStudentPaymentController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    payment.status = 'CANCELLED'
    await payment.save()

    await payment.load('student')

    return response.ok(payment)
  }
}
