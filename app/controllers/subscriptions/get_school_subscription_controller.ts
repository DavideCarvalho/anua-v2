import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import AppException from '#exceptions/app_exception'

export default class GetSchoolSubscriptionController {
  async handle({ params }: HttpContext) {
    const { schoolId } = params

    const subscription = await Subscription.query()
      .where('schoolId', schoolId)
      .preload('school')
      .preload('schoolChain')
      .preload('plan')
      .preload('invoices')
      .first()

    if (!subscription) {
      throw AppException.notFound('Subscription not found for this school')
    }

    return subscription
  }
}
