import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exam from './exam.js'
import Student from './student.js'

export default class ExamGrade extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare score: number

  @column()
  declare feedback: string | null

  @column()
  declare absent: boolean

  @column()
  declare examId: string

  @column()
  declare studentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Exam)
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
