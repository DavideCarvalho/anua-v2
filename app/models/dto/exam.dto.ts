import { BaseModelDto } from '@adocasts.com/dto/base'
import type Exam from '#models/exam'
import type { DateTime } from 'luxon'

export default class ExamDto extends BaseModelDto {
  declare id: string
  declare title: string
  declare description: string | null
  declare scheduledDate: DateTime
  declare maxScore: number
  declare weight: number
  declare type: string
  declare status: string
  declare instructions: string | null
  declare schoolId: string
  declare classId: string
  declare subjectId: string | null
  declare teacherId: string
  declare academicPeriodId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare class: { id: string; name: string } | null
  declare subject: { id: string; name: string } | null
  declare teacher: { id: string } | null
  declare gradesCount: number

  constructor(exam?: Exam) {
    super()

    if (!exam) return

    this.id = exam.id
    this.title = exam.title
    this.description = exam.description
    this.scheduledDate = exam.examDate
    this.maxScore = exam.maxScore
    this.weight = exam.weight
    this.type = exam.type
    this.status = exam.status
    this.instructions = exam.instructions
    this.schoolId = exam.schoolId
    this.classId = exam.classId
    this.subjectId = exam.subjectId
    this.teacherId = exam.teacherId
    this.academicPeriodId = exam.academicPeriodId
    this.createdAt = exam.createdAt
    this.updatedAt = exam.updatedAt
    this.class = exam.class ? { id: exam.class.id, name: exam.class.name } : null
    this.subject = exam.subject ? { id: exam.subject.id, name: exam.subject.name } : null
    this.teacher = exam.teacher ? { id: exam.teacher.id } : null
    this.gradesCount = Number(exam.$extras?.gradesCount ?? 0)
  }
}
