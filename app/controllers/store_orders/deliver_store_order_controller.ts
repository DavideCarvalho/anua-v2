import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class DeliverStoreOrderController {
  async handle({ params, auth, response }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.find(id)

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    const allowedStatuses = ['APPROVED', 'PREPARING', 'READY']
    if (!allowedStatuses.includes(order.status)) {
      return response.badRequest({
        message: `Cannot deliver order with status: ${order.status}`,
      })
    }

    order.status = 'DELIVERED'
    order.deliveredAt = DateTime.now()
    order.deliveredBy = auth.user?.id ?? null

    await order.save()

    await order.load('student')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(order)
  }
}
