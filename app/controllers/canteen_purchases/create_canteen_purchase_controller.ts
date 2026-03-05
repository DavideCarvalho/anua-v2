import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenPurchase, { type CanteenPurchaseStatus } from '#models/canteen_purchase'
import CanteenPurchaseDto from '#models/dto/canteen_purchase.dto'
import CanteenItem from '#models/canteen_item'
import CanteenItemPurchased from '#models/canteen_item_purchased'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentHasLevel from '#models/student_has_level'
import ContractPaymentDay from '#models/contract_payment_day'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'
import { createCanteenPurchaseValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenPurchaseController {
  private async resolveStudentEnrollmentForFiado(payload: {
    userId: string
    studentHasLevelId?: string
  }) {
    const student = await Student.find(payload.userId)
    if (!student) {
      throw AppException.badRequest('Fiado disponível apenas para alunos')
    }

    if (payload.studentHasLevelId) {
      const selected = await StudentHasLevel.query()
        .where('id', payload.studentHasLevelId)
        .where('studentId', student.id)
        .whereNull('deletedAt')
        .first()

      if (!selected) {
        throw AppException.badRequest('Período letivo selecionado é inválido para este aluno')
      }

      return selected
    }

    const activeEnrollments = await StudentHasLevel.query()
      .where('studentId', student.id)
      .whereNull('deletedAt')
      .whereNotNull('contractId')

    if (activeEnrollments.length === 0) {
      throw AppException.badRequest('Aluno não possui vínculo com contrato para compra fiada')
    }

    if (activeEnrollments.length > 1) {
      throw AppException.badRequest(
        'Aluno possui múltiplos períodos letivos. Informe o período para lançar o fiado.'
      )
    }

    return activeEnrollments[0]
  }

  private async resolveDueDateForFiado(enrollment: StudentHasLevel) {
    const contractId = enrollment.contractId
    if (!contractId) {
      throw AppException.badRequest('Vínculo selecionado não possui contrato para cobrança')
    }

    const contractPaymentDay = await ContractPaymentDay.query()
      .where('contractId', contractId)
      .orderBy('day', 'asc')
      .first()

    const paymentDay = enrollment.paymentDay ?? contractPaymentDay?.day ?? 5
    const now = DateTime.now()
    const dueDate = now.set({ day: Math.min(paymentDay, now.daysInMonth ?? 28) })

    return { contractId, dueDate }
  }

  async handle(ctx: HttpContext) {
    const { request, response, auth, logger } = ctx
    const payload = await request.validateUsing(createCanteenPurchaseValidator)

    // Validate that all items exist and are active
    const itemIds = payload.items.map((item) => item.canteenItemId)
    const canteenItems = await CanteenItem.query()
      .whereIn('id', itemIds)
      .where('isActive', true)
      .where('canteenId', payload.canteenId)

    if (canteenItems.length !== itemIds.length) {
      const foundIds = canteenItems.map((item) => item.id)
      const missingOrInactiveIds = itemIds.filter((id) => !foundIds.includes(id))
      throw AppException.badRequest(
        `Itens inválidos ou inativos: ${missingOrInactiveIds.join(', ')}`
      )
    }

    // Create a map for quick price lookup
    const itemPriceMap = new Map(canteenItems.map((item) => [item.id, item.price]))

    // Calculate total amount from items (sum of item.price * quantity)
    let totalAmount = 0
    for (const item of payload.items) {
      const unitPrice = itemPriceMap.get(item.canteenItemId)!
      totalAmount += unitPrice * item.quantity
    }

    let studentForBalance: Student | null = null
    let previousBalance: number | null = null
    let newBalance: number | null = null

    if (payload.paymentMethod === 'BALANCE') {
      studentForBalance = await Student.find(payload.userId)
      if (!studentForBalance) {
        throw AppException.badRequest('Saldo disponível apenas para alunos')
      }

      const latestTransaction = await StudentBalanceTransaction.query()
        .where('studentId', studentForBalance.id)
        .where('status', 'COMPLETED')
        .orderBy('createdAt', 'desc')
        .first()

      previousBalance = latestTransaction?.newBalance ?? studentForBalance.balance ?? 0
      if (previousBalance < totalAmount) {
        throw AppException.badRequest(`Saldo insuficiente. Saldo atual: ${previousBalance}`)
      }

      newBalance = previousBalance - totalAmount
    }

    // Determine status and paidAt based on payment method
    const isOnAccount = payload.paymentMethod === 'ON_ACCOUNT'
    let status: CanteenPurchaseStatus = isOnAccount ? 'PENDING' : 'PAID'
    let paidAt = isOnAccount ? null : DateTime.now()

    let studentPaymentId: string | null = null

    if (payload.paymentMethod === 'BALANCE') {
      status = 'PAID'
      paidAt = DateTime.now()
    }

    if (isOnAccount) {
      const enrollment = await this.resolveStudentEnrollmentForFiado(payload)
      const { contractId, dueDate } = await this.resolveDueDateForFiado(enrollment)

      const studentPayment = await StudentPayment.create({
        studentId: payload.userId,
        amount: totalAmount,
        month: dueDate.month,
        year: dueDate.year,
        type: 'CANTEEN',
        status: 'NOT_PAID',
        totalAmount,
        dueDate,
        installments: 1,
        installmentNumber: 1,
        discountPercentage: 0,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        contractId,
        studentHasLevelId: enrollment.id,
      })

      studentPaymentId = studentPayment.id
    }

    // Create CanteenPurchase
    const purchase = await CanteenPurchase.create({
      userId: payload.userId,
      canteenId: payload.canteenId,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      studentPaymentId,
      status,
      paidAt,
    })

    // Create CanteenItemPurchased records for each item
    for (const item of payload.items) {
      const unitPrice = itemPriceMap.get(item.canteenItemId)!

      await CanteenItemPurchased.create({
        canteenPurchaseId: purchase.id,
        canteenItemId: item.canteenItemId,
        quantity: item.quantity,
        price: unitPrice,
      })
    }

    if (
      payload.paymentMethod === 'BALANCE' &&
      studentForBalance &&
      previousBalance !== null &&
      newBalance !== null
    ) {
      await StudentBalanceTransaction.create({
        studentId: studentForBalance.id,
        amount: totalAmount,
        type: 'CANTEEN_PURCHASE',
        status: 'COMPLETED',
        description: 'Compra na cantina',
        previousBalance,
        newBalance,
        canteenPurchaseId: purchase.id,
        paymentMethod: 'BALANCE',
      })

      studentForBalance.balance = newBalance
      await studentForBalance.save()
    }

    if (studentPaymentId) {
      try {
        await BillingReconciliationService.reconcileByPaymentId(studentPaymentId)
      } catch (error) {
        logger.error({ error }, '[CANTEEN_FIADO] Failed to reconcile invoice synchronously')
      }

      try {
        await ReconcilePaymentInvoiceJob.dispatch({
          paymentId: studentPaymentId,
          triggeredBy: auth.user ? { id: auth.user.id, name: auth.user.name ?? 'Unknown' } : null,
          source: 'canteen-purchases.create-fiado',
        })
      } catch (error) {
        logger.error({ error }, '[CANTEEN_FIADO] Failed to dispatch invoice reconcile job')
      }
    }

    // Load relationships and return
    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased', (query) => {
      query.preload('item')
    })

    return response.created(new CanteenPurchaseDto(purchase))
  }
}
