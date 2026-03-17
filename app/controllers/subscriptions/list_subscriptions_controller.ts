import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import { listSubscriptionsValidator } from '#validators/subscription'
import SubscriptionTransformer from '#transformers/subscription_transformer'

export default class ListSubscriptionsController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listSubscriptionsValidator)

    const { schoolId, schoolChainId, status, page = 1, limit = 20 } = payload

    const query = Subscription.query()
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices', (invoiceQuery) => {
        invoiceQuery.whereNotNull('lastChargeError').orderBy('updatedAt', 'desc').limit(1)
      })
      .orderBy('createdAt', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (schoolChainId) {
      query.where('schoolChainId', schoolChainId)
    }

    if (status) {
      query.where('status', status)
    }

    const subscriptions = await query.paginate(page, limit)

    const items = subscriptions.all()
    const metadata = subscriptions.getMeta()
    return serialize(SubscriptionTransformer.paginate(items, metadata))
  }
}
