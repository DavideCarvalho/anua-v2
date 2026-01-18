import type { HttpContext } from '@adonisjs/core/http'
import SubscriptionInvoice from '#models/subscription_invoice'
import { listSubscriptionInvoicesValidator } from '#validators/subscription'

export default class ListSubscriptionInvoicesController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listSubscriptionInvoicesValidator)

    const { subscriptionId, status, month, year, page = 1, limit = 20 } = payload

    const query = SubscriptionInvoice.query()
      .preload('subscription')
      .orderBy('createdAt', 'desc')

    if (subscriptionId) {
      query.where('subscriptionId', subscriptionId)
    }

    if (status) {
      query.where('status', status)
    }

    if (month) {
      query.where('month', month)
    }

    if (year) {
      query.where('year', year)
    }

    const invoices = await query.paginate(page, limit)

    return invoices
  }
}
