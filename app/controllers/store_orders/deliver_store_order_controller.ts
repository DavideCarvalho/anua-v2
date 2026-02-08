import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import StoreOrderDto from '#models/dto/store_order.dto'
import { deliverStoreOrderValidator } from '#validators/gamification'

export default class DeliverStoreOrderController {
  async handle({ params, request, auth, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(deliverStoreOrderValidator)

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
    order.deliveredAt = payload.deliveredAt
      ? DateTime.fromISO(payload.deliveredAt)
      : DateTime.now()
    order.deliveredBy = auth.user?.id ?? null

    await order.save()

    await order.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(new StoreOrderDto(order))
  }
}
