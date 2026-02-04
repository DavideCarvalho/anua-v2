import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreDto from '#models/dto/store.dto'
import { listStoresValidator } from '#validators/store'

export default class ListStoresController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(listStoresValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = Store.query()
      .preload('school')
      .preload('owner')
      .whereNull('deletedAt')
      .orderBy('name', 'asc')

    if (data.schoolId) {
      query.where('schoolId', data.schoolId)
    }

    if (data.type) {
      query.where('type', data.type)
    }

    if (data.isActive !== undefined) {
      query.where('isActive', data.isActive)
    }

    const stores = await query.paginate(page, limit)

    return StoreDto.fromPaginator(stores)
  }
}
