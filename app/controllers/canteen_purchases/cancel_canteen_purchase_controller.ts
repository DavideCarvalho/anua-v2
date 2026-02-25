import type { HttpContext } from '@adonisjs/core/http'
import { getQueueManager } from '#services/queue_service'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenPurchaseDto from '#models/dto/canteen_purchase.dto'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'
import AppException from '#exceptions/app_exception'

export default class CancelCanteenPurchaseController {
  async handle({ params, response, auth }: HttpContext) {
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

    if (purchase.studentPaymentId) {
      const linkedPayment = await StudentPayment.find(purchase.studentPaymentId)
      if (linkedPayment && linkedPayment.status !== 'CANCELLED') {
        linkedPayment.status = 'CANCELLED'
        linkedPayment.paidAt = null
        await linkedPayment.save()

        try {
          await BillingReconciliationService.reconcileByPaymentId(linkedPayment.id)
        } catch (error) {
          console.error(
            '[CANTEEN_FIADO] Failed to reconcile invoice synchronously on cancel:',
            error
          )
        }

        try {
          await getQueueManager()
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId: linkedPayment.id,
            triggeredBy: auth.user ? { id: auth.user.id, name: auth.user.name ?? 'Unknown' } : null,
            source: 'canteen-purchases.cancel',
          })
        } catch (error) {
          console.error(
            '[CANTEEN_FIADO] Failed to dispatch invoice reconcile job on cancel:',
            error
          )
        }
      }
    }

    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased')

    return response.ok(new CanteenPurchaseDto(purchase))
  }
}
