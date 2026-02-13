import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { markAsBoughtValidator } from '#validators/purchase_request'
import { DateTime } from 'luxon'
import AppException from '#exceptions/app_exception'

export default class MarkAsBoughtController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(markAsBoughtValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      throw AppException.notFound('Solicitação de compra não encontrada')
    }

    // Can only mark as bought if status is APPROVED
    if (purchaseRequest.status !== 'APPROVED') {
      throw AppException.badRequest(
        'Só é possível marcar como comprada uma solicitação com status APPROVED'
      )
    }

    purchaseRequest.status = 'BOUGHT'
    purchaseRequest.finalQuantity = data.finalQuantity
    purchaseRequest.finalUnitValue = data.finalUnitValue
    purchaseRequest.finalValue = data.finalValue
    purchaseRequest.estimatedArrivalDate = DateTime.fromJSDate(data.estimatedArrivalDate)
    purchaseRequest.purchaseDate = DateTime.now()
    if (data.receiptPath) {
      purchaseRequest.receiptPath = data.receiptPath
    }

    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
