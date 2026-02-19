import { BaseModelDto } from '@adocasts.com/dto/base'
import type Assignment from '#models/assignment'
import type { DateTime } from 'luxon'

export default class AssignmentDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare dueDate: Date
  declare grade: number
  declare teacherHasClassId: string
  declare academicPeriodId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(assignment?: Assignment) {
    super()

    if (!assignment) return

    this.id = assignment.id
    this.name = assignment.name
    this.description = assignment.description
    this.dueDate = assignment.dueDate.toJSDate()
    this.grade = assignment.grade
    this.teacherHasClassId = assignment.teacherHasClassId
    this.academicPeriodId = assignment.academicPeriodId
    this.createdAt = assignment.createdAt.toJSDate()
    this.updatedAt = assignment.updatedAt.toJSDate()
  }
}
