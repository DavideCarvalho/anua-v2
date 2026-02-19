import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasExtraClassAttendance from '#models/student_has_extra_class_attendance'
import type { ExtraClassAttendanceStatus } from '#models/student_has_extra_class_attendance'
import type { DateTime } from 'luxon'
import StudentDto from './student.dto.js'

export default class StudentHasExtraClassAttendanceDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare extraClassAttendanceId: string
  declare status: ExtraClassAttendanceStatus
  declare justification: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare student?: StudentDto

  constructor(model?: StudentHasExtraClassAttendance) {
    super()
    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.extraClassAttendanceId = model.extraClassAttendanceId
    this.status = model.status
    this.justification = model.justification
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
    this.student = model.student ? new StudentDto(model.student) : undefined
  }
}
