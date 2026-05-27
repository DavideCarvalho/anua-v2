import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import AppException from '#exceptions/app_exception'
import { getVapidPublicKey } from '#services/push_notification_service'

const subscriptionValidator = vine.compile(
  vine.object({
    endpoint: vine.string().url(),
    keys: vine.object({
      p256dh: vine.string(),
      auth: vine.string(),
    }),
  })
)

export default class PushSubscriptionController {
  async getVapidKey() {
    return { vapidPublicKey: getVapidPublicKey() }
  }

  async subscribe({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user) throw AppException.invalidCredentials()

    const subscription = await request.validateUsing(subscriptionValidator)
    user.pushSubscription = JSON.stringify(subscription)
    await user.save()

    return { subscribed: true }
  }

  async unsubscribe({ auth }: HttpContext) {
    const user = auth.user
    if (!user) throw AppException.invalidCredentials()

    user.pushSubscription = null
    await user.save()

    return { unsubscribed: true }
  }
}
