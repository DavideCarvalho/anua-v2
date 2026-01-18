import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'

export default class ListPurchasesByUserController {
  async handle({ params, request, response }: HttpContext) {
    const { userId } = params
    const { page = 1, limit = 20 } = request.qs()

    const purchases = await CanteenPurchase.query()
      .where('userId', userId)
      .preload('canteen')
      .preload('itemsPurchased')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(purchases)
  }
}
