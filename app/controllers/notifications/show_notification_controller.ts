import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import AppException from '#exceptions/app_exception'
import NotificationTransformer from '#transformers/notification_transformer'

export default class ShowNotificationController {
  async handle({ params, auth, effectiveUser, serialize }: HttpContext) {
    const { id } = params

    const user = effectiveUser ?? auth.user!
    const notification = await Notification.query().where('id', id).where('userId', user.id).first()

    if (!notification) {
      throw AppException.notFound('Notificação não encontrada')
    }

    return serialize(NotificationTransformer.transform(notification))
  }
}
