import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class ListMyOrdersController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser!
    const studentId = request.input('studentId')
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')

    let resolvedStudentId: string

    if (studentId) {
      // Responsible viewing child's orders
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', studentId)
        .first()

      if (!relation) {
        throw AppException.forbidden('Você não é responsável por este aluno')
      }
      resolvedStudentId = studentId
    } else {
      resolvedStudentId = user.id
    }

    const query = StoreOrder.query()
      .where('studentId', resolvedStudentId)
      .preload('store')
      .preload('items', (q) => q.preload('storeItem'))
      .orderBy('createdAt', 'desc')

    if (status) query.where('status', status)

    const orders = await query.paginate(page, limit)
    return response.ok(orders)
  }
}
