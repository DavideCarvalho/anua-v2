import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'
import StoreSettlementTransformer from '#transformers/store_settlement_transformer'
import { listStoreSettlementsValidator } from '#validators/store'

export default class ListStoreSettlementsController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listStoreSettlementsValidator)

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const query = StoreSettlement.query()
      .preload('store')
      .orderBy('year', 'desc')
      .orderBy('month', 'desc')

    if (filters.storeId) {
      query.where('storeId', filters.storeId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.month) {
      query.where('month', filters.month)
    }

    if (filters.year) {
      query.where('year', filters.year)
    }

    const settlements = await query.paginate(page, limit)

    const items = settlements.all()
    const metadata = settlements.getMeta()

    return serialize(StoreSettlementTransformer.paginate(items, metadata))
  }
}
