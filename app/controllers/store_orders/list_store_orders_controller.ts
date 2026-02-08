import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StoreOrderDto from '#models/dto/store_order.dto'
import { listStoreOrdersValidator } from '#validators/gamification'

export default class ListStoreOrdersController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listStoreOrdersValidator)

    const page = payload.page || 1
    const limit = payload.limit || 10

    const query = StoreOrder.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('storeItem')
      })
      .orderBy('createdAt', 'desc')

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    if (payload.storeId) {
      query.where('storeId', payload.storeId)
    }

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    if (payload.paymentMode) {
      query.where('paymentMode', payload.paymentMode)
    }

    if (payload.search) {
      query.whereHas('student', (studentQuery) => {
        studentQuery.where('name', 'ilike', `%${payload.search}%`)
      })
    }

    const orders = await query.paginate(page, limit)

    return StoreOrderDto.fromPaginator(orders)
  }
}
