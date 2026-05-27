import webpush from 'web-push'
import env from '#start/env'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'

const vapidPublicKey = env.get('VAPID_PUBLIC_KEY', '')
const vapidPrivateKey = env.get('VAPID_PRIVATE_KEY', '')
const vapidSubject = env.get('VAPID_SUBJECT', 'mailto:suporte@anua.com.br')

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

export async function sendPushNotification(userId: string, payload: PushPayload): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.warn('VAPID keys not configured, skipping push notification')
    return false
  }

  const user = await User.find(userId)
  if (!user?.pushSubscription) return false

  try {
    const subscription = JSON.parse(user.pushSubscription)
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return true
  } catch (error) {
    if (error instanceof webpush.WebPushError && error.statusCode === 410) {
      user.pushSubscription = null
      await user.save()
      logger.info({ userId }, 'Push subscription expired, removed')
    } else {
      logger.error({ userId, error }, 'Failed to send push notification')
    }
    return false
  }
}

export function getVapidPublicKey(): string {
  return vapidPublicKey
}
