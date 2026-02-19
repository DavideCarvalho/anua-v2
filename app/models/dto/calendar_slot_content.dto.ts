import { BaseModelDto } from '@adocasts.com/dto/base'
import type CalendarSlotContent from '#models/calendar_slot_content'
import type { DateTime } from 'luxon'

export default class CalendarSlotContentDto extends BaseModelDto {
  declare id: string
  declare title: string
  declare content: string
  declare calendarSlotId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(calendarSlotContent?: CalendarSlotContent) {
    super()

    if (!calendarSlotContent) return

    this.id = calendarSlotContent.id
    this.title = calendarSlotContent.title
    this.content = calendarSlotContent.content
    this.calendarSlotId = calendarSlotContent.calendarSlotId
    this.createdAt = calendarSlotContent.createdAt
    this.updatedAt = calendarSlotContent.updatedAt
  }
}
