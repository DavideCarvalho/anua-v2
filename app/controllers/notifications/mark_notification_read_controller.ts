import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class MarkNotificationReadController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const { id } = params

    const user = effectiveUser ?? auth.user!
    const notification = await Notification.query()
      .where('id', id)
      .where('userId', user.id)
      .first()

    if (!notification) {
      return response.notFound({ message: 'Notification not found' })
    }

    if (!notification.isRead) {
      notification.readAt = DateTime.now()
      notification.isRead = true
      await notification.save()
    }

    return response.ok(notification)
  }
}
