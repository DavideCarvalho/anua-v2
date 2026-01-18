import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'

export default class ShowCanteenPurchaseController {
  async handle({ params, response }: HttpContext) {
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
      return response.notFound({ message: 'Canteen purchase not found' })
    }

    return response.ok(purchase)
  }
}
