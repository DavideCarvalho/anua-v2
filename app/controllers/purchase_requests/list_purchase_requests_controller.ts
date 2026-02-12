import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import PurchaseRequestDto from '#models/dto/purchase_request.dto'
import AppException from '#exceptions/app_exception'

export default class ListPurchaseRequestsController {
  async handle({ request }: HttpContext) {
    const { schoolId, status, page = 1, limit = 20 } = request.qs()

    if (!schoolId) {
      throw AppException.badRequest('schoolId é obrigatório')
    }

    const query = PurchaseRequest.query()
      .where('schoolId', schoolId)
      .preload('requestingUser')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const purchaseRequests = await query.paginate(page, limit)

    return PurchaseRequestDto.fromPaginator(purchaseRequests)
  }
}
