import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class MarkReadyController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'PREPARING') {
      return response.badRequest({
        message: `Não é possível marcar como pronto pedido com status: ${order.status}`,
      })
    }

    order.status = 'READY'
    order.readyAt = DateTime.now()
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
