import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import StoreItemDto from '#models/dto/store_item.dto'
import { listStoreItemsValidator } from '#validators/gamification'

export default class ListOwnProductsController {
  async handle({ storeOwnerStore, request }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(listStoreItemsValidator)
    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = StoreItem.query()
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .orderBy('name', 'asc')

    if (data.category) query.where('category', data.category)
    if (data.paymentMode) query.where('paymentMode', data.paymentMode)
    if (data.isActive !== undefined) query.where('isActive', data.isActive)

    const items = await query.paginate(page, limit)
    return StoreItemDto.fromPaginator(items)
  }
}
