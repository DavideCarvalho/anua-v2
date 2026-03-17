import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'
import AppException from '#exceptions/app_exception'
import NotificationTransformer from '#transformers/notification_transformer'

export default class MarkNotificationReadController {
  async handle({ params, auth, effectiveUser, serialize }: HttpContext) {
    const { id } = params

    const user = effectiveUser ?? auth.user!
    const notification = await Notification.query().where('id', id).where('userId', user.id).first()

    if (!notification) {
      throw AppException.notFound('Notificação não encontrada')
    }

    if (!notification.isRead) {
      notification.readAt = DateTime.now()
      notification.isRead = true
      await notification.save()
    }

    return serialize(NotificationTransformer.transform(notification))
  }
}
