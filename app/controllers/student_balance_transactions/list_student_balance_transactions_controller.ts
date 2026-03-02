import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import { listStudentBalanceTransactionsValidator } from '#validators/student_balance_transaction'
import StudentBalanceTransactionTransformer from '#transformers/student_balance_transaction_transformer'

export default class ListStudentBalanceTransactionsController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listStudentBalanceTransactionsValidator)

    const page = payload.page || 1
    const limit = payload.limit || 10

    const query = StudentBalanceTransaction.query().preload('student').orderBy('createdAt', 'desc')

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.type) {
      query.where('type', payload.type)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    const transactions = await query.paginate(page, limit)
    const data = transactions.all()
    const metadata = transactions.getMeta()

    return serialize(StudentBalanceTransactionTransformer.paginate(data, metadata))
  }
}
