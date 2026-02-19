import { BaseModelDto } from '@adocasts.com/dto/base'
import type Attendance from '#models/attendance'

export default class AttendanceDto extends BaseModelDto {
  declare id: string
  declare note: string | null
  declare date: Date
  declare calendarSlotId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(attendance?: Attendance) {
    super()

    if (!attendance) return

    this.id = attendance.id
    this.note = attendance.note
    this.date = attendance.date.toJSDate()
    this.calendarSlotId = attendance.calendarSlotId
    this.createdAt = attendance.createdAt.toJSDate()
    this.updatedAt = attendance.updatedAt.toJSDate()
  }
}
