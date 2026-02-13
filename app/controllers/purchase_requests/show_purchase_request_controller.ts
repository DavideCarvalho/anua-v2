import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import AppException from '#exceptions/app_exception'

export default class ShowPurchaseRequestController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const purchaseRequest = await PurchaseRequest.query()
      .where('id', id)
      .preload('requestingUser')
      .preload('school')
      .first()

    if (!purchaseRequest) {
      throw AppException.notFound('Solicitação de compra não encontrada')
    }

    return response.ok(purchaseRequest)
  }
}
