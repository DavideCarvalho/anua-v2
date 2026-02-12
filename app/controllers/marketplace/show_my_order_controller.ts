import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class ShowMyOrderController {
  async handle({ params, request, response, effectiveUser }: HttpContext) {
    const user = effectiveUser!
    const studentId = request.input('studentId')

    const order = await StoreOrder.query()
      .where('id', params.id)
      .preload('store')
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .preload('studentPayment')
      .first()

    if (!order) {
      throw AppException.storeOrderNotFound()
    }

    // Verify access: student owns order or responsible is linked
    if (order.studentId === user.id) {
      return response.ok(order)
    }

    if (studentId) {
      const relation = await StudentHasResponsible.query()
        .where('responsibleId', user.id)
        .where('studentId', order.studentId)
        .first()

      if (relation) {
        return response.ok(order)
      }
    }

    throw AppException.forbidden('Acesso negado')
  }
}
