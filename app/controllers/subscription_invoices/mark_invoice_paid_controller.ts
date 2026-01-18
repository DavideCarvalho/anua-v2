import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SubscriptionInvoice from '#models/subscription_invoice'

export default class MarkInvoicePaidController {
  async handle({ params, response }: HttpContext) {
    const invoice = await SubscriptionInvoice.find(params.id)

    if (!invoice) {
      return response.notFound({ message: 'Subscription invoice not found' })
    }

    invoice.status = 'PAID'
    invoice.paidAt = DateTime.now()
    await invoice.save()

    await invoice.load('subscription')

    return invoice
  }
}
