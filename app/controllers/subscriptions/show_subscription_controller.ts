import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'

export default class ShowSubscriptionController {
  async handle({ params, response }: HttpContext) {
    const subscription = await Subscription.query()
      .where('id', params.id)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found' })
    }

    return subscription
  }
}
