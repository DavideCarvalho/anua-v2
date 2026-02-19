import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventAttachment from '#models/event_attachment'
import type { DateTime } from 'luxon'

export default class EventAttachmentDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare fileName: string
  declare originalName: string
  declare mimeType: string
  declare size: number
  declare url: string
  declare description: string | null
  declare createdAt: DateTime

  constructor(eventAttachment?: EventAttachment) {
    super()

    if (!eventAttachment) return

    this.id = eventAttachment.id
    this.eventId = eventAttachment.eventId
    this.fileName = eventAttachment.fileName
    this.originalName = eventAttachment.originalName
    this.mimeType = eventAttachment.mimeType
    this.size = eventAttachment.size
    this.url = eventAttachment.url
    this.description = eventAttachment.description
    this.createdAt = eventAttachment.createdAt
  }
}
