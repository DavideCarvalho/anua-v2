import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'
import StoreSettlementTransformer from '#transformers/store_settlement_transformer'

export default class ListSettlementsController {
  async handle({ storeOwnerStore, request, serialize }: HttpContext) {
    const store = storeOwnerStore!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    const query = StoreSettlement.query()
      .where('storeId', store.id)
      .orderBy('year', 'desc')
      .orderBy('month', 'desc')

    if (status) query.where('status', status)

    const settlements = await query.paginate(page, limit)
    const data = settlements.all()
    const metadata = settlements.getMeta()

    return serialize(StoreSettlementTransformer.paginate(data, metadata))
  }
}
