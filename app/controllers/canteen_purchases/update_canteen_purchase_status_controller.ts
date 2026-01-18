import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenPurchase from '#models/canteen_purchase'
import Student from '#models/student'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import { updateCanteenPurchaseStatusValidator } from '#validators/canteen'

export default class UpdateCanteenPurchaseStatusController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateCanteenPurchaseStatusValidator)

    const purchase = await CanteenPurchase.find(id)

    if (!purchase) {
      return response.notFound({ message: 'Canteen purchase not found' })
    }

    purchase.status = payload.status

    if (payload.status === 'PAID') {
      purchase.paidAt = DateTime.now()

      if (purchase.paymentMethod === 'BALANCE') {
        const existingTransaction = await StudentBalanceTransaction.query()
          .where('canteenPurchaseId', purchase.id)
          .where('type', 'CANTEEN_PURCHASE')
          .where('status', 'COMPLETED')
          .first()

        if (!existingTransaction) {
          const student = await Student.find(purchase.userId)
          if (!student) {
            return response.badRequest({ message: 'Aluno não encontrado para débito' })
          }

          const latestTransaction = await StudentBalanceTransaction.query()
            .where('studentId', student.id)
            .where('status', 'COMPLETED')
            .orderBy('createdAt', 'desc')
            .first()

          const previousBalance = latestTransaction?.newBalance ?? student.balance ?? 0

          if (previousBalance < purchase.totalAmount) {
            return response.badRequest({ message: 'Saldo insuficiente', balance: previousBalance })
          }

          const newBalance = previousBalance - purchase.totalAmount

          await StudentBalanceTransaction.create({
            studentId: student.id,
            amount: purchase.totalAmount,
            type: 'CANTEEN_PURCHASE',
            status: 'COMPLETED',
            description: 'Compra na cantina',
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

    await purchase.save()

    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased')

    return response.ok(purchase)
  }
}
