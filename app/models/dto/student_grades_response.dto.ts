import { BaseModelDto } from '@adocasts.com/dto/base'
import type { DateTime } from 'luxon'

export class SubjectGradeDto extends BaseModelDto {
  declare subjectId: string
  declare subjectName: string
  declare totalScore: number
  declare maxPossibleScore: number
  declare assignmentsCount: number
  declare gradedCount: number
  declare pendingCount: number
  declare average: number

  constructor(data: {
    subjectId: string
    subjectName: string
    totalScore: number
    maxPossibleScore: number
    assignmentsCount: number
    gradedCount: number
    pendingCount: number
    average: number
  }) {
    super()
    this.subjectId = data.subjectId
    this.subjectName = data.subjectName
    this.totalScore = data.totalScore
    this.maxPossibleScore = data.maxPossibleScore
    this.assignmentsCount = data.assignmentsCount
    this.gradedCount = data.gradedCount
    this.pendingCount = data.pendingCount
    this.average = data.average
  }
}

export class RecentAssignmentDto extends BaseModelDto {
  declare assignmentId: string
  declare title: string
  declare subjectName: string
  declare maxScore: number
  declare score: number | null
  declare status: string
  declare dueDate: DateTime | null
  declare submittedAt: DateTime | null
  declare gradedAt: DateTime | null

  constructor(data: {
    assignmentId: string
    title: string
    subjectName: string
    maxScore: number
    score: number | null
    status: string
    dueDate: DateTime | null
    submittedAt: DateTime | null
    gradedAt: DateTime | null
  }) {
    super()
    this.assignmentId = data.assignmentId
    this.title = data.title
    this.subjectName = data.subjectName
    this.maxScore = data.maxScore
    this.score = data.score
    this.status = data.status
    this.dueDate = data.dueDate
    this.submittedAt = data.submittedAt
    this.gradedAt = data.gradedAt
  }
}

export class GradesSummaryDto extends BaseModelDto {
  declare overallAverage: number
  declare totalScore: number
  declare maxPossibleScore: number

  constructor(data: { overallAverage: number; totalScore: number; maxPossibleScore: number }) {
    super()
    this.overallAverage = data.overallAverage
    this.totalScore = data.totalScore
    this.maxPossibleScore = data.maxPossibleScore
  }
}

export class StudentGradesResponseDto extends BaseModelDto {
  declare bySubject: SubjectGradeDto[]
  declare recentAssignments: RecentAssignmentDto[]
  declare summary: GradesSummaryDto

  constructor(data: {
    bySubject: SubjectGradeDto[]
    recentAssignments: RecentAssignmentDto[]
    summary: GradesSummaryDto
  }) {
    super()
    this.bySubject = data.bySubject
    this.recentAssignments = data.recentAssignments
    this.summary = data.summary
  }
}
