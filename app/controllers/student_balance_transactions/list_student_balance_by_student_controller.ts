import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'

export default class ListStudentBalanceByStudentController {
  async handle({ params, request, response }: HttpContext) {
    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const transactions = await StudentBalanceTransaction.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(transactions)
  }
}
