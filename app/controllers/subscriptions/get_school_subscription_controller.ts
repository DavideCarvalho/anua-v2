import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'

export default class GetSchoolSubscriptionController {
  async handle({ params, response }: HttpContext) {
    const { schoolId } = params

    const subscription = await Subscription.query()
      .where('schoolId', schoolId)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found for this school' })
    }

    return subscription
  }
}
