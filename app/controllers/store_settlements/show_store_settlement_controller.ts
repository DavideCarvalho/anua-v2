import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'

export default class ShowStoreSettlementController {
  async handle({ params, response }: HttpContext) {
    const settlement = await StoreSettlement.query()
      .where('id', params.id)
      .preload('store')
      .preload('approver')
      .preload('orders')
      .firstOrFail()

    return response.ok(settlement)
  }
}
