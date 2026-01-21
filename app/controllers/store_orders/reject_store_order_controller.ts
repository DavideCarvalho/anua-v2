import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import { rejectStoreOrderValidator } from '#validators/gamification'

export default class RejectStoreOrderController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(rejectStoreOrderValidator)

    const order = await StoreOrder.find(id)

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELED') {
      return response.badRequest({
        message: `Cannot reject order with status: ${order.status}`,
      })
    }

    order.status = 'REJECTED'
    // Model uses cancellationReason, not rejectionReason
    order.cancellationReason = payload.reason

    await order.save()

    await order.load('student')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(order)
  }
}
