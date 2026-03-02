import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import PurchaseRequestTransformer from '#transformers/purchase_request_transformer'
import { listPurchaseRequestsValidator } from '#validators/purchase_request'

export default class ListPurchaseRequestsController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listPurchaseRequestsValidator)
    const schoolId = filters.schoolId
    const status = filters.status
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const query = PurchaseRequest.query()
      .where('schoolId', schoolId)
      .preload('requestingUser')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const purchaseRequests = await query.paginate(page, limit)
    const data = purchaseRequests.all()
    const metadata = purchaseRequests.getMeta()

    return serialize(PurchaseRequestTransformer.paginate(data, metadata))
  }
}
