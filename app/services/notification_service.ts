import Notification from '#models/notification'
import NotificationPreference from '#models/notification_preference'
import User from '#models/user'
import type { NotificationType } from '#models/notification'
import logger from '@adonisjs/core/services/logger'
import { v7 as uuidv7 } from 'uuid'

async function safeDispatch(dispatcher: { then: Function }, notificationId: string) {
  try {
    await dispatcher
  } catch (err) {
    logger.error({ err, notificationId }, 'Failed to dispatch notification job')
  }
}

export interface SendNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  actionUrl?: string
  /**
   * Sobrescreve canais quando o caller já cuida de um deles (ex: comunicado
   * dispara email rico via `SchoolAnnouncementMail` e passa `email: false`
   * aqui pra evitar duplicidade). Quando omitido, segue `NotificationPreference`.
   */
  channels?: {
    email?: boolean
    whatsApp?: boolean
    push?: boolean
  }
}

export class NotificationService {
  async send(params: SendNotificationParams): Promise<Notification> {
    const { userId, type, title, message, data, actionUrl, channels } = params

    const user = await User.find(userId)
    if (!user) {
      logger.warn({ userId }, 'User not found for notification')
      throw new Error(`User ${userId} not found`)
    }

    const notification = await Notification.create({
      id: uuidv7(),
      userId,
      type: type as any,
      title,
      message,
      data: data || null,
      isRead: false,
      sentViaInApp: true,
      sentViaEmail: false,
      sentViaWhatsApp: false,
      sentViaPush: false,
      sentViaSms: false,
      actionUrl: actionUrl || null,
    })

    const pref = await NotificationPreference.query()
      .where('userId', userId)
      .where('notificationType', type)
      .first()

    const enableEmail =
      channels?.email !== undefined ? channels.email : pref ? pref.enableEmail : true
    const enableWhatsApp =
      channels?.whatsApp !== undefined ? channels.whatsApp : pref ? pref.enableWhatsApp : false

    const dispatches: Promise<unknown>[] = []

    if (enableEmail && user.email) {
      const { default: EmailNotificationJob } =
        await import('#jobs/notifications/email_notification_job')
      dispatches.push(
        safeDispatch(
          EmailNotificationJob.dispatch({ notificationId: notification.id, userId }),
          notification.id
        )
      )
    }

    if (enableWhatsApp && user.phone) {
      const { default: WhatsAppNotificationJob } =
        await import('#jobs/notifications/whatsapp_notification_job')
      dispatches.push(
        safeDispatch(
          WhatsAppNotificationJob.dispatch({ notificationId: notification.id, userId }),
          notification.id
        )
      )
    }

    const enablePush =
      channels?.push !== undefined ? channels.push : pref ? pref.enablePush : true
    if (enablePush && user.pushSubscription) {
      const { sendPushNotification } = await import('#services/push_notification_service')
      dispatches.push(
        safeDispatch(
          sendPushNotification(userId, {
            title,
            body: message,
            url: actionUrl,
          }).then((sent) => {
            if (sent) {
              notification.sentViaPush = true
              return notification.save()
            }
          }),
          notification.id
        )
      )
    }

    await Promise.all(dispatches)

    return notification
  }
}

export const notificationService = new NotificationService()
