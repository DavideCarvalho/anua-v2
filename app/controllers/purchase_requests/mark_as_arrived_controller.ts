import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { markAsArrivedValidator } from '#validators/purchase_request'
import { DateTime } from 'luxon'
import AppException from '#exceptions/app_exception'

export default class MarkAsArrivedController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(markAsArrivedValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      throw AppException.notFound('Solicitação de compra não encontrada')
    }

    // Can only mark as arrived if status is BOUGHT
    if (purchaseRequest.status !== 'BOUGHT') {
      throw AppException.badRequest(
        'Só é possível marcar como recebida uma solicitação com status BOUGHT'
      )
    }

    purchaseRequest.status = 'ARRIVED'
    purchaseRequest.arrivalDate = DateTime.fromJSDate(data.arrivalDate)

    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
