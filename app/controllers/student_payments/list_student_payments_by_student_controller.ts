import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'

export default class ListStudentPaymentsByStudentController {
  async handle({ params, request, response }: HttpContext) {
    const { studentId } = params
    const { page = 1, limit = 20 } = request.qs()

    const payments = await StudentPayment.query()
      .where('studentId', studentId)
      .orderBy('dueDate', 'desc')
      .paginate(page, limit)

    return response.ok(payments)
  }
}
