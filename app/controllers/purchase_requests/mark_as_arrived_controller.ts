import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { markAsArrivedValidator } from '#validators/purchase_request'
import { DateTime } from 'luxon'

export default class MarkAsArrivedController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(markAsArrivedValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      return response.notFound({ message: 'Purchase request not found' })
    }

    // Can only mark as arrived if status is BOUGHT
    if (purchaseRequest.status !== 'BOUGHT') {
      return response.badRequest({
        message: 'Can only mark as arrived purchase requests with BOUGHT status',
      })
    }

    purchaseRequest.status = 'ARRIVED'
    purchaseRequest.arrivalDate = DateTime.fromJSDate(data.arrivalDate)

    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
