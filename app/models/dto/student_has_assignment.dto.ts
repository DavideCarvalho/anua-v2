import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasAssignment from '#models/student_has_assignment'
import type { DateTime } from 'luxon'

export default class StudentHasAssignmentDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare assignmentId: string
  declare grade: number | null
  declare submittedAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentHasAssignment) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.assignmentId = model.assignmentId
    this.grade = model.grade
    this.submittedAt = model.submittedAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
