import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Subscription from '#models/subscription'
import SubscriptionStatusHistory from '#models/subscription_status_history'
import { cancelSubscriptionValidator } from '#validators/subscription'

export default class CancelSubscriptionController {
  async handle({ params, request, response }: HttpContext) {
    const subscription = await Subscription.find(params.id)

    if (!subscription) {
      return response.notFound({ message: 'Subscription not found' })
    }

    const data = await request.validateUsing(cancelSubscriptionValidator)

    const previousStatus = subscription.status
    const now = DateTime.now()

    subscription.status = 'CANCELED'
    subscription.canceledAt = now
    await subscription.save()

    await SubscriptionStatusHistory.create({
      subscriptionId: subscription.id,
      fromStatus: previousStatus,
      toStatus: 'CANCELED',
      reason: data.reason,
      changedAt: now,
    })

    await subscription.load('school')
    await subscription.load('schoolChain')
    await subscription.load('plan')

    return subscription
  }
}
