import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionInvoice from '#models/subscription_invoice'
import AppException from '#exceptions/app_exception'

export default class ShowSubscriptionInvoiceController {
  async handle({ params }: HttpContext) {
    const invoice = await SubscriptionInvoice.query()
      .where('id', params.id)
      .preload('subscription')
      .first()

    if (!invoice) {
      throw AppException.notFound('Fatura de assinatura não encontrada')
    }

    return invoice
  }
}
