import type { HttpContext } from '@adonisjs/core/http'
import StoreOrder from '#models/store_order'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ShowMyOrderController {
  async handle({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const studentId = request.input('studentId')

    const order = await StoreOrder.query()
      .where('id', params.id)
      .preload('store')
      .preload('student')
      .preload('items', (q) => q.preload('storeItem'))
      .preload('studentPayment')
      .first()

    if (!order) {
      return response.notFound({ message: 'Pedido nao encontrado' })
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

    return response.forbidden({ message: 'Acesso negado' })
  }
}
