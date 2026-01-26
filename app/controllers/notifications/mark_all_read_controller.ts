import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class MarkAllReadController {
  async handle({ response, auth, effectiveUser }: HttpContext) {
    const now = DateTime.now()

    const user = effectiveUser ?? auth.user!
    const result = await Notification.query()
      .where('userId', user.id)
      .where('isRead', false)
      .update({
        isRead: true,
        readAt: now.toSQL(),
      })

    return response.ok({
      message: 'All notifications marked as read',
      count: result[0] || 0,
    })
  }
}
