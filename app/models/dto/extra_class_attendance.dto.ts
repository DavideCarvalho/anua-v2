import { BaseModelDto } from '@adocasts.com/dto/base'
import type ExtraClassAttendance from '#models/extra_class_attendance'
import type { DateTime } from 'luxon'
import StudentHasExtraClassAttendanceDto from './student_has_extra_class_attendance.dto.js'

export default class ExtraClassAttendanceDto extends BaseModelDto {
  declare id: string
  declare extraClassId: string
  declare extraClassScheduleId: string
  declare date: DateTime
  declare note: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare studentAttendances?: StudentHasExtraClassAttendanceDto[]

  constructor(model?: ExtraClassAttendance) {
    super()
    if (!model) return

    this.id = model.id
    this.extraClassId = model.extraClassId
    this.extraClassScheduleId = model.extraClassScheduleId
    this.date = model.date
    this.note = model.note
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
    this.studentAttendances = model.studentAttendances
      ? model.studentAttendances.map((sa) => new StudentHasExtraClassAttendanceDto(sa))
      : undefined
  }
}
