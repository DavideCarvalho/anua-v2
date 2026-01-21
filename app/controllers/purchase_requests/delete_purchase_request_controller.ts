import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'

export default class DeletePurchaseRequestController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      return response.notFound({ message: 'Purchase request not found' })
    }

    // Only the requesting user can delete their own request
    if (purchaseRequest.requestingUserId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only delete your own purchase requests' })
    }

    // Can only delete if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      return response.badRequest({
        message: 'Cannot delete a purchase request that has already been processed',
      })
    }

    await purchaseRequest.delete()

    return response.ok({ message: 'Purchase request deleted successfully' })
  }
}
