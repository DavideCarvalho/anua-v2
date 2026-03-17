import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'
import StoreSettlementTransformer from '#transformers/store_settlement_transformer'

export default class ShowStoreSettlementController {
  async handle({ params, response, serialize }: HttpContext) {
    const settlement = await StoreSettlement.query()
      .where('id', params.id)
      .preload('store')
      .preload('approver')
      .preload('orders')
      .firstOrFail()

    return response.ok(await serialize(StoreSettlementTransformer.transform(settlement)))
  }
}
