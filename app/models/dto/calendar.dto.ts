import { BaseModelDto } from '@adocasts.com/dto/base'
import type Calendar from '#models/calendar'
import type { DateTime } from 'luxon'

export default class CalendarDto extends BaseModelDto {
  declare id: string
  declare classId: string
  declare name: string
  declare academicPeriodId: string
  declare isActive: boolean
  declare isCanceled: boolean
  declare isApproved: boolean
  declare canceledForNextCalendarId: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(calendar?: Calendar) {
    super()

    if (!calendar) return

    this.id = calendar.id
    this.classId = calendar.classId
    this.name = calendar.name
    this.academicPeriodId = calendar.academicPeriodId
    this.isActive = calendar.isActive
    this.isCanceled = calendar.isCanceled
    this.isApproved = calendar.isApproved
    this.canceledForNextCalendarId = calendar.canceledForNextCalendarId
    this.createdAt = calendar.createdAt.toJSDate()
    this.updatedAt = calendar.updatedAt.toJSDate()
  }
}
