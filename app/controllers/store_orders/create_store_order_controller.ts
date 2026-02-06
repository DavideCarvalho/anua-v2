import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import StoreOrderItem from '#models/store_order_item'
import StoreItem from '#models/store_item'
import Store from '#models/store'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import StudentHasLevel from '#models/student_has_level'
import { createStoreOrderValidator } from '#validators/gamification'

export default class CreateStoreOrderController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStoreOrderValidator)

    // 1. GUARD: Student has active StudentHasLevel (extract contractId)
    const studentHasLevel = await StudentHasLevel.query()
      .where('studentId', payload.studentId)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
      .first()

    if (!studentHasLevel || !studentHasLevel.contractId) {
      return response.badRequest({
        message: 'Student does not have an active enrollment with a contract',
      })
    }

    const contractId = studentHasLevel.contractId

    // 2. GUARD: Store exists, is active, same school (if storeId provided)
    let store: Store | null = null
    if (payload.storeId) {
      store = await Store.query().where('id', payload.storeId).whereNull('deletedAt').first()

      if (!store) {
        return response.notFound({ message: 'Store not found' })
      }

      if (!store.isActive) {
        return response.badRequest({ message: 'Store is not active' })
      }

      if (store.schoolId !== payload.schoolId) {
        return response.badRequest({ message: 'Store does not belong to this school' })
      }
    }

    // 3. GUARD: Items exist, active, belong to store (if storeId provided)
    const storeItemIds = payload.items.map((item) => item.storeItemId)
    const storeItems = await StoreItem.query().whereIn('id', storeItemIds).whereNull('deletedAt')

    const storeItemMap = new Map(storeItems.map((item) => [item.id, item]))

    let totalMoney = 0
    let totalPoints = 0
    const orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }> = []

    for (const item of payload.items) {
      const storeItem = storeItemMap.get(item.storeItemId)

      if (!storeItem) {
        return response.notFound({
          message: `Store item not found: ${item.storeItemId}`,
        })
      }

      if (!storeItem.isActive) {
        return response.badRequest({
          message: `Store item is not available: ${storeItem.name}`,
        })
      }

      if (payload.storeId && storeItem.storeId && storeItem.storeId !== payload.storeId) {
        return response.badRequest({
          message: `Item ${storeItem.name} does not belong to the specified store`,
        })
      }

      // 4. GUARD: Stock check
      if (storeItem.totalStock !== null && storeItem.totalStock < item.quantity) {
        return response.badRequest({
          message: `Insufficient stock for ${storeItem.name}. Available: ${storeItem.totalStock}`,
        })
      }

      const itemTotal = storeItem.price * item.quantity
      totalMoney += itemTotal
      totalPoints += itemTotal

      orderItems.push({
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: storeItem.price,
        totalPrice: itemTotal,
      })
    }

    const paymentMode = payload.paymentMode ?? 'IMMEDIATE'
    const paymentMethod = payload.paymentMethod ?? null
    const now = DateTime.now()

    let studentPaymentId: string | null = null

    // 5. Payment flow
    if (paymentMode === 'IMMEDIATE') {
      if (paymentMethod === 'BALANCE') {
        // Debit student balance
        const student = await Student.findOrFail(payload.studentId)

        const latestTransaction = await StudentBalanceTransaction.query()
          .where('studentId', student.id)
          .where('status', 'COMPLETED')
          .orderBy('createdAt', 'desc')
          .first()

        const previousBalance = latestTransaction?.newBalance ?? student.balance ?? 0

        if (previousBalance < totalMoney) {
          return response.badRequest({
            message: 'Saldo insuficiente',
            balance: previousBalance,
          })
        }

        const newBalance = previousBalance - totalMoney

        // Create the order first to get the ID for the balance transaction
        const order = await StoreOrder.create({
          studentId: payload.studentId,
          schoolId: payload.schoolId,
          storeId: payload.storeId ?? null,
          totalPoints,
          totalPrice: totalMoney,
          totalMoney,
          status: 'PENDING_APPROVAL',
          paymentMode: 'IMMEDIATE',
          paymentMethod: 'BALANCE',
          paidAt: now,
          studentNotes: payload.notes ?? null,
        })

        await StudentBalanceTransaction.create({
          studentId: student.id,
          amount: totalMoney,
          type: 'STORE_PURCHASE',
          status: 'COMPLETED',
          description: 'Compra na loja',
          previousBalance,
          newBalance,
          storeOrderId: order.id,
          paymentMethod: 'BALANCE',
        })

        student.balance = newBalance
        await student.save()

        // Create order items and decrement stock
        await this.createOrderItems(orderItems, order.id, storeItemMap)
        await this.decrementStock(orderItems, storeItemMap)

        await order.load('student')
        await order.load('items', (query) => {
          query.preload('storeItem')
        })
        if (order.storeId) {
          await order.load('store')
        }

        return response.created(order)
      }

      // PIX, CASH, CARD - direct payment
      const order = await StoreOrder.create({
        studentId: payload.studentId,
        schoolId: payload.schoolId,
        storeId: payload.storeId ?? null,
        totalPoints,
        totalPrice: totalMoney,
        totalMoney,
        status: 'PENDING_APPROVAL',
        paymentMode: 'IMMEDIATE',
        paymentMethod: paymentMethod,
        paidAt: now,
        studentNotes: payload.notes ?? null,
      })

      await this.createOrderItems(orderItems, order.id, storeItemMap)
      await this.decrementStock(orderItems, storeItemMap)

      await order.load('student')
      await order.load('items', (query) => {
        query.preload('storeItem')
      })
      if (order.storeId) {
        await order.load('store')
      }

      return response.created(order)
    }

    // 6. DEFERRED payment - create StudentPayment(s)
    const installments = payload.installments ?? 1
    const dueDate = payload.dueDate
      ? DateTime.fromJSDate(payload.dueDate)
      : now.plus({ months: 1 }).set({ day: 10 })

    const firstPayment = await StudentPayment.create({
      studentId: payload.studentId,
      amount: installments === 1 ? totalMoney : Math.ceil(totalMoney / installments),
      month: dueDate.month,
      year: dueDate.year,
      type: 'STORE',
      status: 'NOT_PAID',
      totalAmount: totalMoney,
      dueDate,
      installments,
      installmentNumber: 1,
      discountPercentage: 0,
      contractId,
      studentHasLevelId: studentHasLevel.id,
    })

    studentPaymentId = firstPayment.id

    // Create additional installments if needed
    for (let i = 2; i <= installments; i++) {
      const installmentDueDate = dueDate.plus({ months: i - 1 })
      await StudentPayment.create({
        studentId: payload.studentId,
        amount:
          i === installments
            ? totalMoney - Math.ceil(totalMoney / installments) * (installments - 1)
            : Math.ceil(totalMoney / installments),
        month: installmentDueDate.month,
        year: installmentDueDate.year,
        type: 'STORE',
        status: 'NOT_PAID',
        totalAmount: totalMoney,
        dueDate: installmentDueDate,
        installments,
        installmentNumber: i,
        discountPercentage: 0,
        contractId,
        studentHasLevelId: studentHasLevel.id,
      })
    }

    const order = await StoreOrder.create({
      studentId: payload.studentId,
      schoolId: payload.schoolId,
      storeId: payload.storeId ?? null,
      totalPoints,
      totalPrice: totalMoney,
      totalMoney,
      status: 'PENDING_PAYMENT',
      paymentMode: 'DEFERRED',
      paymentMethod: null,
      studentPaymentId,
      studentNotes: payload.notes ?? null,
    })

    await this.createOrderItems(orderItems, order.id, storeItemMap)
    await this.decrementStock(orderItems, storeItemMap)

    await order.load('student')
    await order.load('studentPayment')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })
    if (order.storeId) {
      await order.load('store')
    }

    return response.created(order)
  }

  private async createOrderItems(
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    orderId: string,
    storeItemMap: Map<string, StoreItem>
  ) {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      await StoreOrderItem.create({
        orderId,
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        paymentMode: 'MONEY',
        pointsToMoneyRate: 1,
        pointsPaid: 0,
        moneyPaid: item.totalPrice,
        itemName: storeItem.name,
        itemDescription: storeItem.description,
        itemImageUrl: storeItem.imageUrl,
      })
    }
  }

  private async decrementStock(
    orderItems: Array<{
      storeItemId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>,
    storeItemMap: Map<string, StoreItem>
  ) {
    for (const item of orderItems) {
      const storeItem = storeItemMap.get(item.storeItemId)!
      if (storeItem.totalStock !== null) {
        storeItem.totalStock -= item.quantity
        await storeItem.save()
      }
    }
  }
}
