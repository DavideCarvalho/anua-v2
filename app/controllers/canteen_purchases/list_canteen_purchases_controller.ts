import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenPurchaseDto from '#models/dto/canteen_purchase.dto'
import { listCanteenPurchasesValidator } from '#validators/canteen'

export default class ListCanteenPurchasesController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listCanteenPurchasesValidator)

    const { canteenId, userId, status, paymentMethod, page = 1, limit = 20 } = payload

    const query = CanteenPurchase.query()
      .preload('user')
      .preload('canteen')
      .preload('itemsPurchased')
      .orderBy('createdAt', 'desc')

    if (canteenId) {
      query.where('canteenId', canteenId)
    }

    if (userId) {
      query.where('userId', userId)
    }

    if (status) {
      query.where('status', status)
    }

    if (paymentMethod) {
      query.where('paymentMethod', paymentMethod)
    }

    const purchases = await query.paginate(page, limit)

    return CanteenPurchaseDto.fromPaginator(purchases)
  }
}
