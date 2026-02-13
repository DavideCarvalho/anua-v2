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

    invoice.status = 'PAID'
    invoice.paidAt = DateTime.now()
    await invoice.save()

    await invoice.load('subscription')

    return invoice
  }
}
