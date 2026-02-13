import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Subscription from '#models/subscription'
import SubscriptionStatusHistory from '#models/subscription_status_history'
import PlatformSettings from '#models/platform_settings'
import { createSubscriptionValidator } from '#validators/subscription'

export default class CreateSubscriptionController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(createSubscriptionValidator)

    const settings = await PlatformSettings.first()
    const trialDays = settings?.defaultTrialDays ?? 14

    const now = DateTime.now()
    const trialEndsAt = now.plus({ days: trialDays })

    const subscription = await Subscription.create({
      ...data,
      status: 'TRIAL',
      billingCycle: data.billingCycle ?? 'MONTHLY',
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
      trialEndsAt: trialEndsAt,
      activeStudents: 0,
      monthlyAmount: 0,
      discount: data.discount ?? 0,
    })

    await SubscriptionStatusHistory.create({
      subscriptionId: subscription.id,
      fromStatus: null,
      toStatus: 'TRIAL',
      reason: 'Assinatura criada',
      changedAt: now,
    })

    await subscription.load('school')
    await subscription.load('schoolChain')
    await subscription.load('plan')

    return subscription
  }
}
