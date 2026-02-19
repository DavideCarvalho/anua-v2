import { BaseModelDto } from '@adocasts.com/dto/base'
import type Notification from '#models/notification'
import type { NotificationType } from '#models/notification'
import type { DateTime } from 'luxon'

export default class NotificationDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare type: NotificationType
  declare title: string
  declare message: string
  declare data: Record<string, unknown> | null
  declare isRead: boolean
  declare readAt: DateTime | null
  declare sentViaInApp: boolean
  declare sentViaEmail: boolean
  declare sentViaPush: boolean
  declare sentViaSms: boolean
  declare sentViaWhatsApp: boolean
  declare emailSentAt: DateTime | null
  declare emailError: string | null
  declare actionUrl: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(notification?: Notification) {
    super()

    if (!notification) return

    this.id = notification.id
    this.userId = notification.userId
    this.type = notification.type
    this.title = notification.title
    this.message = notification.message
    this.data = notification.data
    this.isRead = notification.isRead
    this.readAt = notification.readAt
    this.sentViaInApp = notification.sentViaInApp
    this.sentViaEmail = notification.sentViaEmail
    this.sentViaPush = notification.sentViaPush
    this.sentViaSms = notification.sentViaSms
    this.sentViaWhatsApp = notification.sentViaWhatsApp
    this.emailSentAt = notification.emailSentAt
    this.emailError = notification.emailError
    this.actionUrl = notification.actionUrl
    this.createdAt = notification.createdAt
    this.updatedAt = notification.updatedAt
  }
}
