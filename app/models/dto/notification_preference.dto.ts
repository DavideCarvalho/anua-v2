import { BaseModelDto } from '@adocasts.com/dto/base'
import type NotificationPreference from '#models/notification_preference'
import type { NotificationType } from '#models/notification'
import type { DateTime } from 'luxon'

export default class NotificationPreferenceDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare notificationType: NotificationType
  declare enableInApp: boolean
  declare enableEmail: boolean
  declare enablePush: boolean
  declare enableSms: boolean
  declare enableWhatsApp: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(notificationPreference?: NotificationPreference) {
    super()

    if (!notificationPreference) return

    this.id = notificationPreference.id
    this.userId = notificationPreference.userId
    this.notificationType = notificationPreference.notificationType
    this.enableInApp = notificationPreference.enableInApp
    this.enableEmail = notificationPreference.enableEmail
    this.enablePush = notificationPreference.enablePush
    this.enableSms = notificationPreference.enableSms
    this.enableWhatsApp = notificationPreference.enableWhatsApp
    this.createdAt = notificationPreference.createdAt
    this.updatedAt = notificationPreference.updatedAt
  }
}
