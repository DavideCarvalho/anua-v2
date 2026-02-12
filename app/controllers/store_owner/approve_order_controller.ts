import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import AppException from '#exceptions/app_exception'

export default class ApproveOrderController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query().where('id', params.id).where('storeId', store.id).first()

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    if (order.status !== 'PENDING_APPROVAL') {
      throw AppException.storeOrderInvalidStatus('approve', order.status)
    }

    order.status = 'APPROVED'
    order.approvedAt = DateTime.now()
    order.approvedBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
