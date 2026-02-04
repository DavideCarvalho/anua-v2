import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class ApproveOrderController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return response.badRequest({
        message: `Não é possível aprovar pedido com status: ${order.status}`,
      })
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
