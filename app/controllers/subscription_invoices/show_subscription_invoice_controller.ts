import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionInvoice from '#models/subscription_invoice'

export default class ShowSubscriptionInvoiceController {
  async handle({ params, response }: HttpContext) {
    const invoice = await SubscriptionInvoice.query()
      .where('id', params.id)
      .preload('subscription')
      .first()

    if (!invoice) {
      return response.notFound({ message: 'Subscription invoice not found' })
    }

    return invoice
  }
}
