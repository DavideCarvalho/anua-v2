import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import { listNotificationsValidator } from '#validators/notification'

export default class ListNotificationsController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const {
      type,
      unreadOnly,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listNotificationsValidator)

    const user = effectiveUser ?? auth.user!
    const query = Notification.query().where('userId', user.id)

    if (type) {
      query.where('type', type)
    }

    // Note: Notification model doesn't have 'channel' or 'status' fields
    // Removing those filters for now

    if (unreadOnly) {
      query.where('isRead', false)
    }

    const notifications = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    // Get unread count
    const unreadCount = await Notification.query()
      .where('userId', user.id)
      .where('isRead', false)
      .count('* as total')

    return response.ok({
      ...notifications.toJSON(),
      unreadCount: Number(unreadCount[0].$extras.total || 0),
    })
  }
}
