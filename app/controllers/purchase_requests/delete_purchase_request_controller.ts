import type { HttpContext } from '@adonisjs/core/http'
import PurchaseRequest from '#models/purchase_request'
import AppException from '#exceptions/app_exception'

export default class DeletePurchaseRequestController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const purchaseRequest = await PurchaseRequest.find(id)

    if (!purchaseRequest) {
      throw AppException.notFound('Solicitação de compra não encontrada')
    }

    // Only the requesting user can delete their own request
    if (purchaseRequest.requestingUserId !== auth.user!.id) {
      throw AppException.forbidden('Você só pode excluir suas próprias solicitações de compra')
    }

    // Can only delete if status is REQUESTED
    if (purchaseRequest.status !== 'REQUESTED') {
      throw AppException.badRequest(
        'Não é possível excluir uma solicitação de compra que já foi processada'
      )
    }

    await purchaseRequest.delete()

    return response.ok({ message: 'Solicitação de compra excluída com sucesso' })
  }
}
