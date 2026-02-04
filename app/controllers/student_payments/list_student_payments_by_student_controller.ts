import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import StudentPaymentDto from '#models/dto/student_payment.dto'

export default class ListStudentPaymentsByStudentController {
  async handle({ params, request }: HttpContext) {
    const { studentId } = params
    const { page = 1, limit = 20 } = request.qs()

    const payments = await StudentPayment.query()
      .where('studentId', studentId)
      .orderBy('dueDate', 'desc')
      .paginate(page, limit)

    return StudentPaymentDto.fromPaginator(payments)
  }
}
