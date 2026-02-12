import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import NotificationDto from '#models/dto/notification.dto'
import AppException from '#exceptions/app_exception'

export default class ShowNotificationController {
  async handle({ params, auth, effectiveUser }: HttpContext) {
    const { id } = params

    const user = effectiveUser ?? auth.user!
    const notification = await Notification.query().where('id', id).where('userId', user.id).first()

    if (!notification) {
      throw AppException.notFound('Notificação não encontrada')
    }

    return new NotificationDto(notification)
  }
}
