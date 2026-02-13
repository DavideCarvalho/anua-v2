import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import AppException from '#exceptions/app_exception'

export default class ShowStudentBalanceTransactionController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const transaction = await StudentBalanceTransaction.query()
      .where('id', id)
      .preload('student')
      .first()

    if (!transaction) {
      throw AppException.notFound('Transação de saldo do aluno não encontrada')
    }

    return response.ok(transaction)
  }
}
