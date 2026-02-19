import { BaseModelDto } from '@adocasts.com/dto/base'
import type CalendarSlot from '#models/calendar_slot'
import type { DateTime } from 'luxon'

export default class CalendarSlotDto extends BaseModelDto {
  declare id: string
  declare teacherHasClassId: string | null
  declare classWeekDay: number
  declare startTime: string
  declare endTime: string
  declare minutes: number
  declare calendarId: string
  declare isBreak: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(calendarSlot?: CalendarSlot) {
    super()

    if (!calendarSlot) return

    this.id = calendarSlot.id
    this.teacherHasClassId = calendarSlot.teacherHasClassId
    this.classWeekDay = calendarSlot.classWeekDay
    this.startTime = calendarSlot.startTime
    this.endTime = calendarSlot.endTime
    this.minutes = calendarSlot.minutes
    this.calendarId = calendarSlot.calendarId
    this.isBreak = calendarSlot.isBreak
    this.createdAt = calendarSlot.createdAt.toJSDate()
    this.updatedAt = calendarSlot.updatedAt.toJSDate()
  }
}
