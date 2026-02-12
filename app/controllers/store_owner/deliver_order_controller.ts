import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import { deliverStoreOrderValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class DeliverOrderController {
  async handle({ storeOwnerStore, params, request, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const payload = await request.validateUsing(deliverStoreOrderValidator)

    const order = await StoreOrder.query().where('id', params.id).where('storeId', store.id).first()

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    const allowedStatuses = ['APPROVED', 'PREPARING', 'READY']
    if (!allowedStatuses.includes(order.status)) {
      throw AppException.storeOrderInvalidStatus('deliver', order.status)
    }

    order.status = 'DELIVERED'
    order.deliveredAt = payload.deliveredAt ? DateTime.fromISO(payload.deliveredAt) : DateTime.now()
    order.deliveredBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
