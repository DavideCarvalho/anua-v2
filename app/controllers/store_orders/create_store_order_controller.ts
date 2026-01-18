import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StoreOrderItem from '#models/store_order_item'
import StoreItem from '#models/store_item'
import { createStoreOrderValidator } from '#validators/gamification'

export default class CreateStoreOrderController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createStoreOrderValidator)

    // Fetch all store items to calculate totals
    const storeItemIds = payload.items.map((item) => item.storeItemId)
    const storeItems = await StoreItem.query().whereIn('id', storeItemIds)

    // Create a map for quick lookup
    const storeItemMap = new Map(storeItems.map((item) => [item.id, item]))

    // Validate all items exist and calculate totals
    let totalPointsCost = 0
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

      const itemTotal = storeItem.price * item.quantity
      totalPointsCost += itemTotal

      orderItems.push({
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: storeItem.price,
        totalPrice: itemTotal,
      })
    }

    // Create the order
    const order = await StoreOrder.create({
      studentId: payload.studentId,
      schoolId: payload.schoolId,
      totalPointsCost,
      pointsCost: totalPointsCost,
      status: 'PENDING_APPROVAL',
      notes: payload.notes ?? null,
    })

    // Create order items
    for (const item of orderItems) {
      await StoreOrderItem.create({
        storeOrderId: order.id,
        storeItemId: item.storeItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })
    }

    // Load relationships
    await order.load('student')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.created(order)
  }
}
