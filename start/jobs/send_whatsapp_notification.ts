import Notification from '#models/notification'
import User from '#models/user'
import { getAraraService, NOTIFICATION_TEMPLATE_MAP } from '#services/arara_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export interface WhatsAppNotificationPayload {
  notificationId: string
  userId: string
}

export async function sendWhatsAppNotification(payload: WhatsAppNotificationPayload): Promise<void> {
  const { notificationId, userId } = payload

  const notification = await Notification.find(notificationId)
  if (!notification) {
    logger.warn({ notificationId }, 'Notification not found for WhatsApp')
    return
  }

  if (notification.sentViaWhatsApp) {
    return
  }

  const user = await User.find(userId)
  if (!user || !user.phone) {
    notification.whatsappError = 'User has no phone number'
    await notification.save()
    return
  }

  const template = NOTIFICATION_TEMPLATE_MAP[notification.type]
  if (!template) {
    logger.warn({ notificationType: notification.type }, 'No WhatsApp template configured')
    return
  }

  const phone = user.phone.replace(/\D/g, '')
  if (phone.length < 10) {
    notification.whatsappError = 'Invalid phone number'
    await notification.save()
    return
  }

  const receiver = `whatsapp:+55${phone}`
  const variables = template.buildVariables(notification.data || {})

  try {
    const arara = getAraraService()
    const response = await arara.sendTemplate({ receiver, templateName: template.templateName, variables })

    notification.sentViaWhatsApp = true
    notification.whatsappSentAt = DateTime.now()
    await notification.save()

    logger.info({ messageId: response.id, notificationId }, 'WhatsApp message sent')
  } catch (error) {
    notification.whatsappError = error instanceof Error ? error.message : 'Unknown error'
    await notification.save()

    logger.error({ error, notificationId }, 'Failed to send WhatsApp notification')
    throw error
  }
}
