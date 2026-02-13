import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'
import Student from '#models/student'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import AppException from '#exceptions/app_exception'

export default class CancelCanteenPurchaseController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const purchase = await CanteenPurchase.find(id)

    if (!purchase) {
      throw AppException.notFound('Compra da cantina não encontrada')
    }

    if (purchase.paymentMethod === 'BALANCE') {
      const chargeTransaction = await StudentBalanceTransaction.query()
        .where('canteenPurchaseId', purchase.id)
        .where('type', 'CANTEEN_PURCHASE')
        .where('status', 'COMPLETED')
        .first()

      if (chargeTransaction) {
        const refundExists = await StudentBalanceTransaction.query()
          .where('canteenPurchaseId', purchase.id)
          .where('type', 'REFUND')
          .where('status', 'COMPLETED')
          .first()

        if (!refundExists) {
          const student = await Student.find(purchase.userId)
          if (!student) {
            throw AppException.badRequest('Aluno não encontrado para reembolso')
          }

          const latestTransaction = await StudentBalanceTransaction.query()
            .where('studentId', student.id)
            .where('status', 'COMPLETED')
            .orderBy('createdAt', 'desc')
            .first()

          const previousBalance = latestTransaction?.newBalance ?? student.balance ?? 0
          const newBalance = previousBalance + purchase.totalAmount

          await StudentBalanceTransaction.create({
            studentId: student.id,
            amount: purchase.totalAmount,
            type: 'REFUND',
            status: 'COMPLETED',
            description: 'Reembolso compra cantina',
            previousBalance,
            newBalance,
            canteenPurchaseId: purchase.id,
            paymentMethod: 'BALANCE',
          })

          student.balance = newBalance
          await student.save()
        }
      }
    }

    purchase.status = 'CANCELLED'
    purchase.paidAt = null
    await purchase.save()

    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased')

    return response.ok(purchase)
  }
}
