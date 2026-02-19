import { BaseModelDto } from '@adocasts.com/dto/base'
import type ExamGrade from '#models/exam_grade'
import type { DateTime } from 'luxon'

export default class ExamGradeDto extends BaseModelDto {
  declare id: string
  declare examId: string
  declare studentId: string
  declare score: number | null
  declare attended: boolean
  declare feedback: string | null
  declare gradedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(examGrade?: ExamGrade) {
    super()

    if (!examGrade) return

    this.id = examGrade.id
    this.examId = examGrade.examId
    this.studentId = examGrade.studentId
    this.score = examGrade.score
    this.attended = examGrade.attended
    this.feedback = examGrade.feedback
    this.gradedAt = examGrade.gradedAt?.toJSDate() ?? null
    this.createdAt = examGrade.createdAt.toJSDate()
    this.updatedAt = examGrade.updatedAt.toJSDate()
  }
}
