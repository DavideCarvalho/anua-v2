import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Subscription from '#models/subscription'
import SubscriptionStatusHistory from '#models/subscription_status_history'
import { pauseSubscriptionValidator } from '#validators/subscription'
import AppException from '#exceptions/app_exception'

export default class PauseSubscriptionController {
  async handle({ params, request }: HttpContext) {
    const subscription = await Subscription.find(params.id)

    if (!subscription) {
      throw AppException.notFound('Subscription not found')
    }

    const data = await request.validateUsing(pauseSubscriptionValidator)

    const previousStatus = subscription.status
    const now = DateTime.now()

    subscription.status = 'PAUSED'
    subscription.pausedAt = now
    await subscription.save()

    await SubscriptionStatusHistory.create({
      subscriptionId: subscription.id,
      fromStatus: previousStatus,
      toStatus: 'PAUSED',
      reason: data.reason ?? 'Subscription paused',
      changedAt: now,
    })

    await subscription.load('school')
    await subscription.load('schoolChain')
    await subscription.load('plan')

    return subscription
  }
}
