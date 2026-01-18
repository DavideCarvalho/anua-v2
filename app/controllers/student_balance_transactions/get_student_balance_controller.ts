import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'

export default class GetStudentBalanceController {
  async handle({ params, response }: HttpContext) {
    const { studentId } = params

    const latestTransaction = await StudentBalanceTransaction.query()
      .where('studentId', studentId)
      .where('status', 'COMPLETED')
      .orderBy('createdAt', 'desc')
      .first()

    const balance = latestTransaction?.newBalance ?? 0

    return response.ok({ studentId, balance })
  }
}
