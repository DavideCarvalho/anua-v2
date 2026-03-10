import { BaseModelDto } from '@adocasts.com/dto/base'
import type Assignment from '#models/assignment'

export default class AssignmentDto extends BaseModelDto {
  declare id: string
  declare name: string
  /** Alias for name — used by frontend */
  declare title: string
  declare description: string | null
  declare dueDate: Date
  declare grade: number | null
  /** Alias for grade — used by frontend */
  declare maxScore: number | null
  declare teacherHasClassId: string
  declare academicPeriodId: string
  declare createdAt: Date
  declare updatedAt: Date
  /** Nested via teacherHasClass relation */
  declare class: { id: string; name: string } | null
  declare subject: { id: string; name: string } | null

  constructor(assignment?: Assignment) {
    super()

    if (!assignment) return

    this.id = assignment.id
    this.name = assignment.name
    this.title = assignment.name
    this.description = assignment.description
    this.dueDate = assignment.dueDate.toJSDate()
    this.grade = assignment.grade
    this.maxScore = assignment.grade
    this.teacherHasClassId = assignment.teacherHasClassId
    this.academicPeriodId = assignment.academicPeriodId
    this.createdAt = assignment.createdAt.toJSDate()
    this.updatedAt = assignment.updatedAt.toJSDate()
    const thc = assignment.teacherHasClass
    this.class = thc?.class ? { id: thc.class.id, name: thc.class.name } : null
    this.subject = thc?.subject ? { id: thc.subject.id, name: thc.subject.name } : null
  }
}
