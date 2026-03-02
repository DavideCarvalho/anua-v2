import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StoreOrderTransformer from '#transformers/store_order_transformer'
import { listStoreOrdersValidator } from '#validators/gamification'

export default class ListOwnOrdersController {
  async handle({ storeOwnerStore, request, serialize }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(listStoreOrdersValidator)
    const page = data.page ?? 1
    const limit = data.limit ?? 10

    const query = StoreOrder.query()
      .where('storeId', store.id)
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .orderBy('createdAt', 'desc')

    if (data.status) query.where('status', data.status)
    if (data.search) {
      query.whereHas('student', (sq) => {
        sq.whereILike('name', `%${data.search}%`)
      })
    }

    const orders = await query.paginate(page, limit)
    const list = orders.all()
    const metadata = orders.getMeta()

    return serialize(StoreOrderTransformer.paginate(list, metadata))
  }
}
