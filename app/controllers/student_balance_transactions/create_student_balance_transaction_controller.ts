import type { HttpContext } from '@adonisjs/core/http'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import { createStudentBalanceTransactionValidator } from '#validators/student_balance_transaction'

export default class CreateStudentBalanceTransactionController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStudentBalanceTransactionValidator)

    // Get the current balance from the latest transaction for this student
    const latestTransaction = await StudentBalanceTransaction.query()
      .where('studentId', payload.studentId)
      .where('status', 'COMPLETED')
      .orderBy('createdAt', 'desc')
      .first()

    const previousBalance = latestTransaction?.newBalance ?? 0

    // Calculate the new balance based on transaction type
    let newBalance: number
    if (payload.type === 'TOP_UP' || payload.type === 'REFUND') {
      newBalance = previousBalance + payload.amount
    } else if (payload.type === 'CANTEEN_PURCHASE' || payload.type === 'STORE_PURCHASE') {
      newBalance = previousBalance - payload.amount
    } else {
      // ADJUSTMENT - amount can be positive or negative
      newBalance = previousBalance + payload.amount
    }

    const transaction = await StudentBalanceTransaction.create({
      studentId: payload.studentId,
      amount: payload.amount,
      type: payload.type,
      status: 'COMPLETED',
      description: payload.description ?? null,
      previousBalance,
      newBalance,
      responsibleId: payload.responsibleId ?? null,
      paymentMethod: payload.paymentMethod ?? null,
    })

    await transaction.load('student')

    return response.created(transaction)
  }
}
