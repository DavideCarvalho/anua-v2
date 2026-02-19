import { BaseModelDto } from '@adocasts.com/dto/base'
import type CalendarSlotContent from '#models/calendar_slot_content'

export default class CalendarSlotContentDto extends BaseModelDto {
  declare id: string
  declare title: string
  declare content: string
  declare calendarSlotId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(calendarSlotContent?: CalendarSlotContent) {
    super()

    if (!calendarSlotContent) return

    this.id = calendarSlotContent.id
    this.title = calendarSlotContent.title
    this.content = calendarSlotContent.content
    this.calendarSlotId = calendarSlotContent.calendarSlotId
    this.createdAt = calendarSlotContent.createdAt.toJSDate()
    this.updatedAt = calendarSlotContent.updatedAt.toJSDate()
  }
}
