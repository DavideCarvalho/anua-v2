import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CanteenPurchase, { type CanteenPurchaseStatus } from '#models/canteen_purchase'
import CanteenItem from '#models/canteen_item'
import CanteenItemPurchased from '#models/canteen_item_purchased'
import Student from '#models/student'
import StudentBalanceTransaction from '#models/student_balance_transaction'
import { createCanteenPurchaseValidator } from '#validators/canteen'

export default class CreateCanteenPurchaseController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCanteenPurchaseValidator)

    // Validate that all items exist and are active
    const itemIds = payload.items.map((item) => item.canteenItemId)
    const canteenItems = await CanteenItem.query().whereIn('id', itemIds).where('isActive', true)

    if (canteenItems.length !== itemIds.length) {
      const foundIds = canteenItems.map((item) => item.id)
      const missingOrInactiveIds = itemIds.filter((id) => !foundIds.includes(id))
      return response.badRequest({
        message: 'Some items do not exist or are not active',
        invalidItems: missingOrInactiveIds,
      })
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
        return response.badRequest({ message: 'Saldo disponível apenas para alunos' })
      }

      const latestTransaction = await StudentBalanceTransaction.query()
        .where('studentId', studentForBalance.id)
        .where('status', 'COMPLETED')
        .orderBy('createdAt', 'desc')
        .first()

      previousBalance = latestTransaction?.newBalance ?? studentForBalance.balance ?? 0
      if (previousBalance < totalAmount) {
        return response.badRequest({ message: 'Saldo insuficiente', balance: previousBalance })
      }

      newBalance = previousBalance - totalAmount
    }

    // Determine status and paidAt based on payment method
    const isPaidImmediately = payload.paymentMethod !== 'BALANCE'
    let status: CanteenPurchaseStatus = isPaidImmediately ? 'PAID' : 'PENDING'
    let paidAt = isPaidImmediately ? DateTime.now() : null

    if (payload.paymentMethod === 'BALANCE') {
      status = 'PAID'
      paidAt = DateTime.now()
    }

    // Create CanteenPurchase
    const purchase = await CanteenPurchase.create({
      userId: payload.userId,
      canteenId: payload.canteenId,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      status,
      paidAt,
    })

    // Create CanteenItemPurchased records for each item
    for (const item of payload.items) {
      const unitPrice = itemPriceMap.get(item.canteenItemId)!
      const itemTotalPrice = unitPrice * item.quantity

      await CanteenItemPurchased.create({
        canteenPurchaseId: purchase.id,
        canteenItemId: item.canteenItemId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotalPrice,
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

    // Load relationships and return
    await purchase.load('user')
    await purchase.load('canteen')
    await purchase.load('itemsPurchased', (query) => {
      query.preload('item')
    })

    return response.created(purchase)
  }
}
