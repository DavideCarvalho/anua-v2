import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenPurchaseTransformer from '#transformers/canteen_purchase_transformer'
import { listCanteenPurchasesValidator } from '#validators/canteen'

export default class ListCanteenPurchasesController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listCanteenPurchasesValidator)

    const { canteenId, userId, search, status, paymentMethod, page = 1, limit = 20 } = payload

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

    if (search) {
      query.where((searchQuery) => {
        searchQuery.whereHas('user', (userQuery) => {
          userQuery.whereILike('name', `%${search}%`)
        })
      })
    }

    if (status) {
      query.where('status', status)
    }

    if (paymentMethod) {
      query.where('paymentMethod', paymentMethod)
    }

    const purchases = await query.paginate(page, limit)

    const data = purchases.all()
    const metadata = purchases.getMeta()

    return serialize(CanteenPurchaseTransformer.paginate(data, metadata))
  }
}
