import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

export default class DeleteNotificationController {
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

    await notification.delete()

    return response.ok({ message: 'Notification deleted successfully' })
  }
}
