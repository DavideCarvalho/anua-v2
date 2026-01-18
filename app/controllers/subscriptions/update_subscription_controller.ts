import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import { updateSubscriptionValidator } from '#validators/subscription'

export default class UpdateSubscriptionController {
  async handle({ params, request, response }: HttpContext) {
    const subscription = await Subscription.find(params.id)

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found' })
    }

    const data = await request.validateUsing(updateSubscriptionValidator)

    subscription.merge(data)
    await subscription.save()

    await subscription.load('school')
    await subscription.load('schoolChain')
    await subscription.load('plan')

    return subscription
  }
}
