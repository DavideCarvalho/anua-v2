import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { rejectPurchaseRequestValidator } from '#validators/purchase_request'

export default class RejectPurchaseRequestController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(rejectPurchaseRequestValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      return response.notFound({ message: 'Purchase request not found' })
    }

    // Can only reject if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      return response.badRequest({
        message: 'Can only reject purchase requests with REQUESTED status',
      })
    }

    purchaseRequest.status = 'REJECTED'
    purchaseRequest.rejectionReason = data.reason
    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
