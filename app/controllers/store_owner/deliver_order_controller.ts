import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'

export default class DeliverOrderController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query().where('id', params.id).where('storeId', store.id).first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    const allowedStatuses = ['APPROVED', 'PREPARING', 'READY']
    if (!allowedStatuses.includes(order.status)) {
      return response.badRequest({
        message: `Não é possível entregar pedido com status: ${order.status}`,
      })
    }

    order.status = 'DELIVERED'
    order.deliveredAt = DateTime.now()
    order.deliveredBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
