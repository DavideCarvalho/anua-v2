import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentBalanceTransactionTransformer from '#transformers/student_balance_transaction_transformer'

export default class ListStudentBalanceByStudentController {
  async handle({ params, request, serialize }: HttpContext) {
    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const transactions = await StudentBalanceTransaction.query()
      .where('studentId', studentId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const data = transactions.all()
    const metadata = transactions.getMeta()

    return serialize(StudentBalanceTransactionTransformer.paginate(data, metadata))
  }
}
