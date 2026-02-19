import { BaseModelDto } from '@adocasts.com/dto/base'
import type { DateTime } from 'luxon'

export class SubjectFilterDto extends BaseModelDto {
  declare id: string
  declare name: string

  constructor(data: { id: string; name: string }) {
    super()
    this.id = data.id
    this.name = data.name
  }
}

export class TeacherDto extends BaseModelDto {
  declare id: string
  declare name: string

  constructor(data: { id: string; name: string }) {
    super()
    this.id = data.id
    this.name = data.name
  }
}

export class SubmissionDto extends BaseModelDto {
  declare id: string
  declare score: number | null
  declare feedback: string | null
  declare status: string
  declare submittedAt: Date | null
  declare gradedAt: Date | null

  constructor(data: {
    id: string
    score: number | null
    feedback: string | null
    status: string
    submittedAt: DateTime | string | null
    gradedAt: DateTime | string | null
  }) {
    super()
    this.id = data.id
    this.score = data.score
    this.feedback = data.feedback
    this.status = data.status
    this.submittedAt = data.submittedAt
      ? typeof data.submittedAt === 'string'
        ? new Date(data.submittedAt)
        : data.submittedAt.toJSDate()
      : null
    this.gradedAt = data.gradedAt
      ? typeof data.gradedAt === 'string'
        ? new Date(data.gradedAt)
        : data.gradedAt.toJSDate()
      : null
  }
}

export class AssignmentDto extends BaseModelDto {
  declare id: string
  declare title: string
  declare description: string | null
  declare instructions: string | null
  declare maxScore: number
  declare dueDate: Date
  declare subject: SubjectFilterDto
  declare teacher: TeacherDto
  declare submission: SubmissionDto | null
  declare computedStatus: string

  constructor(data: {
    id: string
    title: string
    description: string | null
    instructions: string | null
    maxScore: number
    dueDate: DateTime | string
    subject: SubjectFilterDto
    teacher: TeacherDto
    submission: SubmissionDto | null
    computedStatus: string
  }) {
    super()
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.instructions = data.instructions
    this.maxScore = data.maxScore
    this.dueDate =
      typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate.toJSDate()
    this.subject = data.subject
    this.teacher = data.teacher
    this.submission = data.submission
    this.computedStatus = data.computedStatus
  }
}

export class AssignmentsSummaryDto extends BaseModelDto {
  declare total: number
  declare pending: number
  declare completed: number
  declare overdue: number

  constructor(data: { total: number; pending: number; completed: number; overdue: number }) {
    super()
    this.total = data.total
    this.pending = data.pending
    this.completed = data.completed
    this.overdue = data.overdue
  }
}

export class StudentAssignmentsResponseDto extends BaseModelDto {
  declare assignments: AssignmentDto[]
  declare subjects: SubjectFilterDto[]
  declare summary: AssignmentsSummaryDto

  constructor(data: {
    assignments: AssignmentDto[]
    subjects: SubjectFilterDto[]
    summary: AssignmentsSummaryDto
  }) {
    super()
    this.assignments = data.assignments
    this.subjects = data.subjects
    this.summary = data.summary
  }
}
