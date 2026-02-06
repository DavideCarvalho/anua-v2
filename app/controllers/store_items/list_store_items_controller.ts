import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import StoreItemDto from '#models/dto/store_item.dto'
import { listStoreItemsValidator } from '#validators/gamification'

export default class ListStoreItemsController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(listStoreItemsValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = StoreItem.query()
      .preload('school')
      .preload('canteenItem')
      .whereNull('deletedAt')
      .orderBy('name', 'asc')

    if (data.storeId) {
      query.where('storeId', data.storeId)
    }

    if (data.schoolId) {
      query.where('schoolId', data.schoolId)
    }

    if (data.category) {
      query.where('category', data.category)
    }

    if (data.paymentMode) {
      query.where('paymentMode', data.paymentMode)
    }

    if (data.isActive !== undefined) {
      query.where('isActive', data.isActive)
    }

    const storeItems = await query.paginate(page, limit)

    return StoreItemDto.fromPaginator(storeItems)
  }
}
