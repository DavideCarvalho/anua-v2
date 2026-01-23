import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventComment from '#models/event_comment'
import type { DateTime } from 'luxon'

export default class EventCommentDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare content: string
  declare parentId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(eventComment?: EventComment) {
    super()

    if (!eventComment) return

    this.id = eventComment.id
    this.eventId = eventComment.eventId
    this.userId = eventComment.userId
    this.content = eventComment.content
    this.parentId = eventComment.parentId
    this.createdAt = eventComment.createdAt
    this.updatedAt = eventComment.updatedAt
  }
}
