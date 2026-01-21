import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

export default class ShowNotificationController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params

    const notification = await Notification.query()
      .where('id', id)
      .where('recipientId', auth.user!.id)
      .first()

    if (!notification) {
      return response.notFound({ message: 'Notification not found' })
    }

    return response.ok(notification)
  }
}
