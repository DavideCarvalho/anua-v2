import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import AppException from '#exceptions/app_exception'

export default class ShowStudentPaymentController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const payment = await StudentPayment.query().where('id', id).preload('student').first()

    if (!payment) {
      throw AppException.notFound('Student payment not found')
    }

    return response.ok(payment)
  }
}
