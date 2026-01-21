import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'

export default class ListPurchaseRequestsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, status, page = 1, limit = 20 } = request.qs()

    if (!schoolId) {
      return response.badRequest({ message: 'School ID is required' })
    }

    const query = PurchaseRequest.query()
      .where('schoolId', schoolId)
      .preload('requestingUser')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const purchaseRequests = await query.paginate(page, limit)

    return response.ok(purchaseRequests)
  }
}
