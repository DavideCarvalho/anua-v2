import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { DateTime } from 'luxon'

export default class MarkAllReadController {
  async handle({ response, auth }: HttpContext) {
    const now = DateTime.now()

    const result = await Notification.query()
      .where('recipientId', auth.user!.id)
      .whereNull('readAt')
      .update({
        readAt: now.toSQL(),
        status: 'READ',
      })

    return response.ok({
      message: 'All notifications marked as read',
      count: result[0] || 0,
    })
  }
}
