import type { HttpContext } from '@adonisjs/core/http'
import StoreSettlement from '#models/store_settlement'
import { listStoreSettlementsValidator } from '#validators/store'

export default class ListStoreSettlementsController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(listStoreSettlementsValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = StoreSettlement.query()
      .preload('store')
      .orderBy('year', 'desc')
      .orderBy('month', 'desc')

    if (data.storeId) {
      query.where('storeId', data.storeId)
    }

    if (data.status) {
      query.where('status', data.status)
    }

    if (data.month) {
      query.where('month', data.month)
    }

    if (data.year) {
      query.where('year', data.year)
    }

    const settlements = await query.paginate(page, limit)

    return response.ok(settlements)
  }
}
