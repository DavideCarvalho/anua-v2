import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'

export default class ShowStudentBalanceTransactionController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const transaction = await StudentBalanceTransaction.query()
      .where('id', id)
      .preload('student')
      .first()

    if (!transaction) {
      return response.notFound({ message: 'Student balance transaction not found' })
    }

    return response.ok(transaction)
  }
}
