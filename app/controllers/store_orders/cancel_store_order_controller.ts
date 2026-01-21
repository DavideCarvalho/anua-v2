import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class CancelStoreOrderController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.find(id)

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    if (order.status === 'DELIVERED') {
      return response.badRequest({
        message: 'Cannot cancel an order that has already been delivered',
      })
    }

    if (order.status === 'CANCELED') {
      return response.badRequest({
        message: 'Order is already canceled',
      })
    }

    order.status = 'CANCELED'
    order.canceledAt = DateTime.now()

    await order.save()

    await order.load('student')
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(order)
  }
}
