import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'
import AppException from '#exceptions/app_exception'
import CanteenPurchaseTransformer from '#transformers/canteen_purchase_transformer'

export default class ShowCanteenPurchaseController {
  async handle({ params, response, serialize }: HttpContext) {
    const { id } = params

    const purchase = await CanteenPurchase.query()
      .where('id', id)
      .preload('user')
      .preload('canteen')
      .preload('itemsPurchased', (query) => {
        query.preload('item')
      })
      .first()

    if (!purchase) {
      throw AppException.notFound('Compra da cantina não encontrada')
    }

    return response.ok(await serialize(CanteenPurchaseTransformer.transform(purchase)))
  }
}
