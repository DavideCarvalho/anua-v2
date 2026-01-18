import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'

export default class ShowStoreOrderController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.query()
      .where('id', id)
      .preload('student')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('storeItem')
      })
      .first()

    if (!order) {
      return response.notFound({ message: 'Store order not found' })
    }

    return response.ok(order)
  }
}
