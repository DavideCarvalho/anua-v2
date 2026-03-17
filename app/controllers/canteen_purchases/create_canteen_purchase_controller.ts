import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import CanteenPurchase, { type CanteenPurchaseStatus } from '#models/canteen_purchase'
import CanteenItem from '#models/canteen_item'
import CanteenMeal from '#models/canteen_meal'
import CanteenItemPurchased from '#models/canteen_item_purchased'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentHasLevel from '#models/student_has_level'
import ContractPaymentDay from '#models/contract_payment_day'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import { createCanteenPurchaseValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'
import CanteenPurchaseTransformer from '#transformers/canteen_purchase_transformer'

type PurchaseItem =
  | { type: 'item'; canteenItemId: string; quantity: number }
  | { type: 'meal'; canteenMealId: string; quantity: number }

export default class CreateCanteenPurchaseController {
  private normalizeItemsSignature(items: PurchaseItem[]) {
    const quantitiesByKey = new Map<string, number>()

    for (const item of items) {
      const key = item.type === 'item' ? `item:${item.canteenItemId}` : `meal:${item.canteenMealId}`
      quantitiesByKey.set(key, (quantitiesByKey.get(key) ?? 0) + item.quantity)
    }

    return [...quantitiesByKey.entries()]
      .map(([k, q]) => `${k}:${q}`)
      .sort()
      .join('|')
  }

  private async ensureNotDuplicateRecentCheckout(payload: {
    userId: string
    canteenId: string
    paymentMethod: string
    totalAmount: number
    items: PurchaseItem[]
  }) {
    const recentPurchases = await CanteenPurchase.query()
      .where('userId', payload.userId)
      .where('canteenId', payload.canteenId)
      .where('paymentMethod', payload.paymentMethod)
      .where('totalAmount', payload.totalAmount)
      .whereNot('status', 'CANCELLED')
      .where('createdAt', '>=', DateTime.now().minus({ seconds: 15 }).toSQL()!)
      .preload('itemsPurchased')
      .orderBy('createdAt', 'desc')
      .limit(5)

    const payloadSignature = this.normalizeItemsSignature(payload.items)

    const duplicate = recentPurchases.find((purchase) => {
      const purchaseItems: PurchaseItem[] = purchase.itemsPurchased.map((item) =>
        item.canteenItemId
          ? { type: 'item' as const, canteenItemId: item.canteenItemId, quantity: item.quantity }
          : { type: 'meal' as const, canteenMealId: item.canteenMealId!, quantity: item.quantity }
      )
      const purchaseSignature = this.normalizeItemsSignature(purchaseItems)
      return purchaseSignature === payloadSignature
    })

    if (duplicate) {
      throw AppException.operationFailedWithProvidedData(409)
    }
  }

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
    const { request, response, auth, logger, serialize } = ctx
    const payload = await request.validateUsing(createCanteenPurchaseValidator)

    const itemIds = payload.items
      .filter(
        (i): i is { type: 'item'; canteenItemId: string; quantity: number } => i.type === 'item'
      )
      .map((i) => i.canteenItemId)
    const mealIds = payload.items
      .filter(
        (i): i is { type: 'meal'; canteenMealId: string; quantity: number } => i.type === 'meal'
      )
      .map((i) => i.canteenMealId)
    const todayIso = DateTime.now().toISODate()

    const canteenItems = await CanteenItem.query()
      .whereIn('id', itemIds)
      .where('isActive', true)
      .where('canteenId', payload.canteenId)

    if (itemIds.length > 0 && canteenItems.length !== itemIds.length) {
      const foundIds = canteenItems.map((item) => item.id)
      const missingOrInactiveIds = itemIds.filter((id) => !foundIds.includes(id))
      throw AppException.badRequest(
        `Itens inválidos ou inativos: ${missingOrInactiveIds.join(', ')}`
      )
    }

    const canteenMeals =
      mealIds.length > 0
        ? await CanteenMeal.query()
            .whereIn('id', mealIds)
            .where('isActive', true)
            .where('canteenId', payload.canteenId)
            .where('date', todayIso!)
        : []

    if (mealIds.length > 0 && canteenMeals.length !== mealIds.length) {
      const foundMealIds = canteenMeals.map((m) => m.id)
      const missingMealIds = mealIds.filter((id) => !foundMealIds.includes(id))
      throw AppException.badRequest(
        `Refeições inválidas, inativas ou fora da data de hoje: ${missingMealIds.join(', ')}`
      )
    }

    const itemPriceMap = new Map<string, number>([
      ...canteenItems.map((item) => [item.id, item.price] as const),
      ...canteenMeals.map((meal) => [meal.id, meal.price] as const),
    ])

    let totalAmount = 0
    for (const item of payload.items) {
      const id = item.type === 'item' ? item.canteenItemId : item.canteenMealId
      const unitPrice = itemPriceMap.get(id)!
      totalAmount += unitPrice * item.quantity
    }

    await this.ensureNotDuplicateRecentCheckout({
      userId: payload.userId,
      canteenId: payload.canteenId,
      paymentMethod: payload.paymentMethod,
      totalAmount,
      items: payload.items,
    })

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
    let purchaseId: string | null = null

    if (payload.paymentMethod === 'BALANCE') {
      status = 'PAID'
      paidAt = DateTime.now()
    }

    await db.transaction(async (trx) => {
      if (isOnAccount) {
        const enrollment = await this.resolveStudentEnrollmentForFiado(payload)
        const { contractId, dueDate } = await this.resolveDueDateForFiado(enrollment)

        const studentPayment = new StudentPayment()
        studentPayment.useTransaction(trx)
        studentPayment.fill({
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
        await studentPayment.save()

        studentPaymentId = studentPayment.id
      }

      const purchase = new CanteenPurchase()
      purchase.useTransaction(trx)
      purchase.fill({
        userId: payload.userId,
        canteenId: payload.canteenId,
        totalAmount,
        paymentMethod: payload.paymentMethod,
        studentPaymentId,
        status,
        paidAt,
      })
      await purchase.save()

      purchaseId = purchase.id

      for (const item of payload.items) {
        const id = item.type === 'item' ? item.canteenItemId : item.canteenMealId
        const unitPrice = itemPriceMap.get(id)!
        const itemPurchased = new CanteenItemPurchased()
        itemPurchased.useTransaction(trx)
        itemPurchased.fill({
          canteenPurchaseId: purchase.id,
          canteenItemId: item.type === 'item' ? item.canteenItemId : null,
          canteenMealId: item.type === 'meal' ? item.canteenMealId : null,
          quantity: item.quantity,
          price: unitPrice,
        })
        await itemPurchased.save()
      }

      if (
        payload.paymentMethod === 'BALANCE' &&
        studentForBalance &&
        previousBalance !== null &&
        newBalance !== null
      ) {
        const balanceTransaction = new StudentBalanceTransaction()
        balanceTransaction.useTransaction(trx)
        balanceTransaction.fill({
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
        await balanceTransaction.save()

        studentForBalance.balance = newBalance
        studentForBalance.useTransaction(trx)
        await studentForBalance.save()
      }
    })

    if (studentPaymentId) {
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

    const purchase = await CanteenPurchase.findOrFail(purchaseId!)

    // Load relationships and return
    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased', (query) => {
      query.preload('item').preload('meal')
    })

    return response.created(await serialize(CanteenPurchaseTransformer.transform(purchase)))
  }
}
