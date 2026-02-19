import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasAssignment from '#models/student_has_assignment'
import type { DateTime } from 'luxon'
import StudentDto from './student.dto.js'

export default class StudentHasAssignmentDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare assignmentId: string
  declare grade: number | null
  declare submittedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare student?: StudentDto

  constructor(model?: StudentHasAssignment) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.assignmentId = model.assignmentId
    this.grade = model.grade
    this.submittedAt = model.submittedAt?.toJSDate() ?? null
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.student = model.student ? new StudentDto(model.student) : undefined
  }
}
