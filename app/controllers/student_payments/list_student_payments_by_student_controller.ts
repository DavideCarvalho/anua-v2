import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class ListStudentPaymentsByStudentController {
  async handle({ params, request, serialize }: HttpContext) {
    const { studentId } = params
    const { page = 1, limit = 20 } = request.qs()

    const payments = await StudentPayment.query()
      .where('studentId', studentId)
      .orderBy('dueDate', 'desc')
      .paginate(page, limit)

    const data = payments.all()
    const metadata = payments.getMeta()

    return serialize(StudentPaymentTransformer.paginate(data, metadata))
  }
}
