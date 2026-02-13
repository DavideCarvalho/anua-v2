import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import { rejectPurchaseRequestValidator } from '#validators/purchase_request'
import AppException from '#exceptions/app_exception'

export default class RejectPurchaseRequestController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(rejectPurchaseRequestValidator)

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      throw AppException.notFound('Solicitação de compra não encontrada')
    }

    // Can only reject if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      throw AppException.badRequest(
        'Só é possível rejeitar solicitações de compra com status REQUESTED'
      )
    }

    purchaseRequest.status = 'REJECTED'
    purchaseRequest.rejectionReason = data.reason
    await purchaseRequest.save()
    await purchaseRequest.load('requestingUser')

    return response.ok(purchaseRequest)
  }
}
