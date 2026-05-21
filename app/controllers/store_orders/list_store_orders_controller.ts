import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StoreOrderTransformer from '#transformers/store_order_transformer'
import { listStoreOrdersValidator } from '#validators/gamification'

export default class ListStoreOrdersController {
  async handle({ request, serialize }: HttpContext) {
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
      // Student não tem coluna name — vem de student.user. Mesma estrutura
      // do invoices/list_invoices_controller.
      const term = `%${payload.search}%`
      query.whereHas('student', (sq) => {
        sq.whereHas('user', (uq) => {
          uq.where((sub) => {
            sub.where('name', 'ilike', term).orWhere('email', 'ilike', term)
          })
        })
      })
    }

    const orders = await query.paginate(page, limit)

    const data = orders.all()
    const metadata = orders.getMeta()

    return serialize(StoreOrderTransformer.paginate(data, metadata))
  }
}
