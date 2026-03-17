import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import AppException from '#exceptions/app_exception'
import StoreOrderTransformer from '#transformers/store_order_transformer'

export default class ApproveStoreOrderController {
  async handle({ params, auth, response, serialize }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.find(id)

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    if (!['PENDING_PAYMENT', 'PENDING_APPROVAL'].includes(order.status)) {
      throw AppException.storeOrderInvalidStatus('approve', order.status)
    }

    order.status = 'APPROVED'
    order.approvedAt = DateTime.now()
    order.approvedBy = auth.user?.id ?? null

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
