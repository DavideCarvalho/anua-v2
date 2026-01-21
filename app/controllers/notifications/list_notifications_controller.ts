import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { listNotificationsValidator } from '#validators/notification'

export default class ListNotificationsController {
  async handle({ request, response, auth }: HttpContext) {
    const {
      type,
      channel,
      status,
      unreadOnly,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listNotificationsValidator)

    const query = Notification.query()
      .where('recipientId', auth.user!.id)

    if (type) {
      query.where('type', type)
    }

    if (channel) {
      query.where('channel', channel)
    }

    if (status) {
      query.where('status', status)
    }

    if (unreadOnly) {
      query.whereNull('readAt')
    }

    const notifications = await query
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Get unread count
    const unreadCount = await Notification.query()
      .where('recipientId', auth.user!.id)
      .whereNull('readAt')
      .count('* as total')

    return response.ok({
      ...notifications.toJSON(),
      unreadCount: Number(unreadCount[0].$extras.total || 0),
    })
  }
}
