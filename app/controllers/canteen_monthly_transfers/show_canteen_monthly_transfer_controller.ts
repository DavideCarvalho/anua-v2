import type { HttpContext } from '@adonisjs/core/http'
import CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenMonthlyTransferController {
  async handle({ params, response }: HttpContext) {
    const transfer = await CanteenMonthlyTransfer.query()
      .where('id', params.id)
      .preload('canteen')
      .preload('purchases', (purchaseQuery) => {
        purchaseQuery.preload('user').preload('itemsPurchased')
      })
      .first()

    if (!transfer) {
      throw AppException.notFound('Transferência não encontrada')
    }

    return response.ok(transfer)
  }
}
