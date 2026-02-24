import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SubscriptionInvoice from '#models/subscription_invoice'
import AppException from '#exceptions/app_exception'

export default class MarkInvoicePaidController {
  async handle({ params }: HttpContext) {
    const invoice = await SubscriptionInvoice.find(params.id)

    if (!invoice) {
      throw AppException.notFound('Fatura de assinatura não encontrada')
    }

    await invoice.load('subscription')

    const hasAutomaticCardBilling =
      invoice.subscription?.paymentMethod === 'CREDIT_CARD' &&
      !!invoice.subscription?.creditCardToken

    if (hasAutomaticCardBilling) {
      throw AppException.badRequest(
        'Esta assinatura possui cobrança automática por cartão. A baixa manual está desabilitada.'
      )
    }

    invoice.status = 'PAID'
    invoice.collectionStatus = 'PAID'
    invoice.paidAt = DateTime.now()
    invoice.nextChargeRetryAt = null
    invoice.lastChargeError = null
    await invoice.save()

    return invoice
  }
}
