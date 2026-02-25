import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenPurchaseDto from '#models/dto/canteen_purchase.dto'
import AppException from '#exceptions/app_exception'

export default class GetStudentCanteenPurchasesController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as compras deste aluno')
    }

    const purchases = await CanteenPurchase.query()
      .where('userId', studentId)
      .preload('canteen')
      .preload('itemsPurchased', (query) => {
        query.preload('item')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return CanteenPurchaseDto.fromPaginator(purchases)
  }
}
