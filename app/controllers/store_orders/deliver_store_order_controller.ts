import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import { deliverStoreOrderValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'
import StoreOrderTransformer from '#transformers/store_order_transformer'

export default class DeliverStoreOrderController {
  async handle({ params, request, auth, response, serialize }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(deliverStoreOrderValidator)

    const order = await StoreOrder.find(id)

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    const allowedStatuses = ['APPROVED', 'PREPARING', 'READY']
    if (!allowedStatuses.includes(order.status)) {
      throw AppException.storeOrderInvalidStatus('deliver', order.status)
    }

    order.status = 'DELIVERED'
    order.deliveredAt = payload.deliveredAt ? DateTime.fromISO(payload.deliveredAt) : DateTime.now()
    order.deliveredBy = auth.user?.id ?? null

    await order.save()

    await order.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })
    await order.load('items', (query) => {
      query.preload('storeItem')
    })

    return response.ok(await serialize(StoreOrderTransformer.transform(order)))
  }
}
