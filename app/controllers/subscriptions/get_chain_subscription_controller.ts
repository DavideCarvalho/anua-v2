import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'

export default class GetChainSubscriptionController {
  async handle({ params, response }: HttpContext) {
    const { schoolChainId } = params

    const subscription = await Subscription.query()
      .where('schoolChainId', schoolChainId)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found for this school chain' })
    }

    return subscription
  }
}
