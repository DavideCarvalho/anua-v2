import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exam from './exam.js'
import Student from './student.js'

export default class ExamGrade extends BaseModel {
  static table = 'exam_grades'

  @beforeCreate()
  static assignId(model: ExamGrade) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'examId' })
  declare examId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'score' })
  declare score: number | null

  @column({ columnName: 'attended' })
  declare attended: boolean

  @column({ columnName: 'feedback' })
  declare feedback: string | null

  @column.dateTime({ columnName: 'gradedAt' })
  declare gradedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Exam, { foreignKey: 'examId' })
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
