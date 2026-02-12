import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import AppException from '#exceptions/app_exception'

export default class ShowSubscriptionController {
  async handle({ params }: HttpContext) {
    const subscription = await Subscription.query()
      .where('id', params.id)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      throw AppException.notFound('Subscription not found')
    }

    return subscription
  }
}
