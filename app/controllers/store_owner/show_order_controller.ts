import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'

export default class ShowOrderController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido não encontrado' })
    }

    return response.ok(order)
  }
}
