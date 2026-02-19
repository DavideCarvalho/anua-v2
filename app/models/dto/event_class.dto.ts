import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventClass from '#models/event_class'
import type { DateTime } from 'luxon'

export default class EventClassDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare classId: string
  declare createdAt: DateTime

  constructor(eventClass?: EventClass) {
    super()

    if (!eventClass) return

    this.id = eventClass.id
    this.eventId = eventClass.eventId
    this.classId = eventClass.classId
    this.createdAt = eventClass.createdAt
  }
}
