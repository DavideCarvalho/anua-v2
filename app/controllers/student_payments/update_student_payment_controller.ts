import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import { updateStudentPaymentValidator } from '#validators/student_payment'

export default class UpdateStudentPaymentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateStudentPaymentValidator)

    const payment = await StudentPayment.find(id)

    if (!payment) {
      return response.notFound({ message: 'Student payment not found' })
    }

    const updateData = {
      ...payload,
      dueDate: payload.dueDate ? DateTime.fromJSDate(payload.dueDate) : undefined,
    }

    payment.merge(updateData)
    await payment.save()

    await payment.load('student')

    return response.ok(payment)
  }
}
