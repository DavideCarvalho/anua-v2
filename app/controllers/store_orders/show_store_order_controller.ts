import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import AppException from '#exceptions/app_exception'
import StoreOrderTransformer from '#transformers/store_order_transformer'

export default class ShowStoreOrderController {
  async handle({ params, response, serialize }: HttpContext) {
    const { id } = params

    const order = await StoreOrder.query()
      .where('id', id)
      .preload('student')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('storeItem')
      })
      .first()

    if (!order) {
      throw AppException.notFound('Pedido da loja não encontrado')
    }

    return response.ok(await serialize(StoreOrderTransformer.transform(order)))
  }
}
