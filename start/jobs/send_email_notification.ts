import mail from '@adonisjs/mail/services/main'
import Notification from '#models/notification'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export interface EmailNotificationPayload {
  notificationId: string
  userId: string
}

export async function sendEmailNotification(payload: EmailNotificationPayload): Promise<void> {
  const { notificationId, userId } = payload

  const notification = await Notification.find(notificationId)
  if (!notification) {
    logger.warn({ notificationId }, 'Notification not found for email')
    return
  }

  if (notification.sentViaEmail) {
    return
  }

  const user = await User.find(userId)
  if (!user || !user.email) {
    notification.emailError = 'User has no email'
    await notification.save()
    return
  }

  try {
    await mail.send((message) => {
      message
        .to(user.email!)
        .subject(notification.title)
        .html(
          `<p>${notification.message}</p>${notification.actionUrl ? `<p><a href="${notification.actionUrl}">Ver detalhes</a></p>` : ''}`
        )
    })

    notification.sentViaEmail = true
    notification.emailSentAt = DateTime.now()
    await notification.save()

    logger.info({ notificationId }, 'Email notification sent')
  } catch (error) {
    notification.emailError = error instanceof Error ? error.message : 'Unknown error'
    await notification.save()

    logger.error({ error, notificationId }, 'Failed to send email notification')
    throw error
  }
}
