import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exam from './exam.js'
import Student from './student.js'

export default class ExamGrade extends BaseModel {
  static table = 'exam_grades'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare examId: string

  @column()
  declare studentId: string

  @column()
  declare score: number | null

  @column()
  declare attended: boolean

  @column()
  declare feedback: string | null

  @column.dateTime()
  declare gradedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Exam, { foreignKey: 'examId' })
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
