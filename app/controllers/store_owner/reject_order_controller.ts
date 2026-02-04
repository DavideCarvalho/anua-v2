import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class RejectOrderController {
  async handle({ storeOwnerStore, params, request, response }: HttpContext) {
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
        message: `Não é possível rejeitar pedido com status: ${order.status}`,
      })
    }

    const { reason } = request.only(['reason'])

    order.status = 'REJECTED'
    order.canceledAt = DateTime.now()
    order.cancellationReason = reason ?? null
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
