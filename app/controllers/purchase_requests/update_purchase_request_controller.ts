import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { updatePurchaseRequestValidator } from '#validators/purchase_request'
import { DateTime } from 'luxon'

export default class UpdatePurchaseRequestController {
  async handle({ params, request, response, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updatePurchaseRequestValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      return response.notFound({ message: 'Purchase request not found' })
    }

    // Only the requesting user can update their own request
    if (purchaseRequest.requestingUserId !== auth.user!.id) {
      return response.forbidden({ message: 'You can only update your own purchase requests' })
    }

    // Can only update if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      return response.badRequest({
        message: 'Cannot update a purchase request that has already been processed',
      })
    }

    purchaseRequest.merge({
      productName: data.productName ?? purchaseRequest.productName,
      quantity: data.quantity ?? purchaseRequest.quantity,
      unitValue: data.unitValue ?? purchaseRequest.unitValue,
      value: data.value ?? purchaseRequest.value,
      dueDate: data.dueDate ? DateTime.fromJSDate(data.dueDate) : purchaseRequest.dueDate,
      productUrl: data.productUrl !== undefined ? data.productUrl : purchaseRequest.productUrl,
      description: data.description !== undefined ? data.description : purchaseRequest.description,
    })

    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
