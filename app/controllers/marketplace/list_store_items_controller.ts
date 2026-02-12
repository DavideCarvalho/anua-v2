import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import StoreItemDto from '#models/dto/store_item.dto'
import Store from '#models/store'
import School from '#models/school'
import AppException from '#exceptions/app_exception'

export default class ListStoreItemsController {
  async handle({ params, request }: HttpContext) {
    const { storeId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const category = request.input('category')

    const store = await Store.query()
      .where('id', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!store) {
      throw AppException.notFound('Loja não encontrada')
    }

    const school = await School.find(store.schoolId)
    const hasOnlinePayment = school?.paymentConfigStatus === 'ACTIVE'

    const now = DateTime.now()
    const query = StoreItem.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .where((q) => {
        q.whereNull('availableFrom').orWhere('availableFrom', '<=', now.toSQL()!)
      })
      .where((q) => {
        q.whereNull('availableUntil').orWhere('availableUntil', '>=', now.toSQL()!)
      })
      .orderBy('name', 'asc')

    if (category) query.where('category', category)

    const items = await query.paginate(page, limit)
    const paginated = StoreItemDto.fromPaginator(items)

    return { ...paginated, hasOnlinePayment }
  }
}
