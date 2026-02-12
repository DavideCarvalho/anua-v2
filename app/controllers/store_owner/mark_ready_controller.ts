import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import AppException from '#exceptions/app_exception'

export default class MarkReadyController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query().where('id', params.id).where('storeId', store.id).first()

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    if (order.status !== 'PREPARING') {
      throw AppException.storeOrderInvalidStatus('mark-ready', order.status)
    }

    order.status = 'READY'
    order.readyAt = DateTime.now()
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
