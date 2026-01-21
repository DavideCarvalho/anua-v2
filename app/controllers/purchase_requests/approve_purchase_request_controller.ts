import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'

export default class ApprovePurchaseRequestController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      return response.notFound({ message: 'Purchase request not found' })
    }

    // Can only approve if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      return response.badRequest({
        message: 'Can only approve purchase requests with REQUESTED status',
      })
    }

    purchaseRequest.status = 'APPROVED'
    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
