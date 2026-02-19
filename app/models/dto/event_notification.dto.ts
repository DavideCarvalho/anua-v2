import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventNotification from '#models/event_notification'
import type { DateTime } from 'luxon'

export default class EventNotificationDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare type: string
  declare title: string
  declare message: string
  declare scheduledFor: DateTime | null
  declare isSent: boolean
  declare sentVia: string[] | null
  declare sentAt: DateTime | null
  declare createdAt: DateTime

  constructor(eventNotification?: EventNotification) {
    super()

    if (!eventNotification) return

    this.id = eventNotification.id
    this.eventId = eventNotification.eventId
    this.userId = eventNotification.userId
    this.type = eventNotification.type
    this.title = eventNotification.title
    this.message = eventNotification.message
    this.scheduledFor = eventNotification.scheduledFor
    this.isSent = eventNotification.isSent
    this.sentVia = eventNotification.sentVia
    this.sentAt = eventNotification.sentAt
    this.createdAt = eventNotification.createdAt
  }
}
