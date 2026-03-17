import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import AppException from '#exceptions/app_exception'
import StoreOrderTransformer from '#transformers/store_order_transformer'

export default class ShowOrderController {
  async handle({ storeOwnerStore, params, response, serialize }: HttpContext) {
    const store = storeOwnerStore!
    const order = await StoreOrder.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .first()

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    return response.ok(await serialize(StoreOrderTransformer.transform(order)))
  }
}
