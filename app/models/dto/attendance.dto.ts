import { BaseModelDto } from '@adocasts.com/dto/base'
import type Attendance from '#models/attendance'
import type { DateTime } from 'luxon'

export default class AttendanceDto extends BaseModelDto {
  declare id: string
  declare note: string | null
  declare date: DateTime
  declare calendarSlotId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(attendance?: Attendance) {
    super()

    if (!attendance) return

    this.id = attendance.id
    this.note = attendance.note
    this.date = attendance.date
    this.calendarSlotId = attendance.calendarSlotId
    this.createdAt = attendance.createdAt
    this.updatedAt = attendance.updatedAt
  }
}
