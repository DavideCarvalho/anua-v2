import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { listStudentPaymentsValidator } from '#validators/student_payment'

export default class ListStudentPaymentsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listStudentPaymentsValidator)

    const { studentId, contractId, status, type, month, year, page = 1, limit = 20 } = payload

    const query = StudentPayment.query()
      .preload('student')
      .orderBy('dueDate', 'desc')

    if (studentId) {
      query.where('studentId', studentId)
    }

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    if (month) {
      query.where('month', month)
    }

    if (year) {
      query.where('year', year)
    }

    const payments = await query.paginate(page, limit)

    return response.ok(payments)
  }
}
