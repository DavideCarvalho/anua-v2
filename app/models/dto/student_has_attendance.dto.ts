import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasAttendance from '#models/student_has_attendance'
import type { AttendanceStatus } from '#models/student_has_attendance'
import type { DateTime } from 'luxon'

export default class StudentHasAttendanceDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare attendanceId: string
  declare status: AttendanceStatus
  declare justification: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentHasAttendance) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.attendanceId = model.attendanceId
    this.status = model.status
    this.justification = model.justification
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
