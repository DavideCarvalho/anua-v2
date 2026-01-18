import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import { listSubscriptionsValidator } from '#validators/subscription'

export default class ListSubscriptionsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listSubscriptionsValidator)

    const { schoolId, schoolChainId, status, page = 1, limit = 20 } = payload

    const query = Subscription.query()
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
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

    return subscriptions
  }
}
