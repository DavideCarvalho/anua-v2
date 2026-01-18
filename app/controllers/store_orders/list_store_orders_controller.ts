import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import { listStoreOrdersValidator } from '#validators/gamification'

export default class ListStoreOrdersController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listStoreOrdersValidator)

    const page = payload.page || 1
    const limit = payload.limit || 10

    const query = StoreOrder.query()
      .preload('student')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('storeItem')
      })
      .orderBy('createdAt', 'desc')

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    if (payload.search) {
      query.whereHas('student', (studentQuery) => {
        studentQuery.where('name', 'ilike', `%${payload.search}%`)
      })
    }

    const orders = await query.paginate(page, limit)

    return response.ok(orders)
  }
}
