import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import { deliverStoreOrderValidator } from '#validators/gamification'

export default class DeliverOrderController {
  async handle({ storeOwnerStore, params, request, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const payload = await request.validateUsing(deliverStoreOrderValidator)

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
    order.deliveredAt = payload.deliveredAt
      ? DateTime.fromISO(payload.deliveredAt)
      : DateTime.now()
    order.deliveredBy = auth.user!.id
    await order.save()

    await order.load('student')
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(order)
  }
}
