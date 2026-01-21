import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class MarkNotificationReadController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const notification = await Notification.query()
      .where('id', id)
      .where('recipientId', auth.user!.id)
      .first()

    if (!notification) {
      return response.notFound({ message: 'Notification not found' })
    }

    if (!notification.readAt) {
      notification.readAt = DateTime.now()
      notification.status = 'READ'
      await notification.save()
    }

    return response.ok(notification)
  }
}
