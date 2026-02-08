import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreOrder from '#models/store_order'
import StoreOrderDto from '#models/dto/store_order.dto'

export default class MarkPreparingController {
  async handle({ storeOwnerStore, params, auth, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query().where('id', params.id).where('storeId', store.id).first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    if (order.status !== 'APPROVED') {
      return response.badRequest({
        message: `Não é possível preparar pedido com status: ${order.status}`,
      })
    }

    order.status = 'PREPARING'
    order.preparingAt = DateTime.now()
    order.preparedBy = auth.user!.id
    await order.save()

    await order.load('student', (studentQuery) => {
      studentQuery.preload('user')
    })
    await order.load('items', (q) => q.preload('storeItem'))

    return response.ok(new StoreOrderDto(order))
  }
}
