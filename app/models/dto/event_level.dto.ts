import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventLevel from '#models/event_level'
import type { DateTime } from 'luxon'

export default class EventLevelDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare levelId: string
  declare createdAt: Date

  constructor(eventLevel?: EventLevel) {
    super()

    if (!eventLevel) return

    this.id = eventLevel.id
    this.eventId = eventLevel.eventId
    this.levelId = eventLevel.levelId
    this.createdAt = eventLevel.createdAt.toJSDate()
  }
}
