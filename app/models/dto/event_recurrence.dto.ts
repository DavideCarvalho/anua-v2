import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventRecurrence from '#models/event_recurrence'

export default class EventRecurrenceDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare pattern: string
  declare interval: number
  declare daysOfWeek: number[] | null
  declare dayOfMonth: number | null
  declare endDate: Date | null
  declare occurrences: number | null
  declare createdAt: Date

  constructor(eventRecurrence?: EventRecurrence) {
    super()

    if (!eventRecurrence) return

    this.id = eventRecurrence.id
    this.eventId = eventRecurrence.eventId
    this.pattern = eventRecurrence.pattern
    this.interval = eventRecurrence.interval
    this.daysOfWeek = eventRecurrence.daysOfWeek
    this.dayOfMonth = eventRecurrence.dayOfMonth
    this.endDate = eventRecurrence.endDate ? eventRecurrence.endDate.toJSDate() : null
    this.occurrences = eventRecurrence.occurrences
    this.createdAt = eventRecurrence.createdAt.toJSDate()
  }
}
