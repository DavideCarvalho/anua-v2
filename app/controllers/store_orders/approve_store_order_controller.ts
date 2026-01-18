import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class ApproveStoreOrderController {
  async handle({ params, auth, response }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.find(id)

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return response.badRequest({
        message: `Cannot approve order with status: ${order.status}`,
      })
    }

    order.status = 'APPROVED'
    order.approvedAt = DateTime.now()
    order.approvedBy = auth.user?.id ?? null

    await order.save()

    await order.load('student')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(order)
  }
}
