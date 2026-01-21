import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Assignment from './assignment.js'

export default class StudentHasAssignment extends BaseModel {
  static table = 'StudentHasAssignment'

  @beforeCreate()
  static assignId(model: StudentHasAssignment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare assignmentId: string

  @column()
  declare grade: number | null

  @column.dateTime()
  declare submittedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Assignment, { foreignKey: 'assignmentId' })
  declare assignment: BelongsTo<typeof Assignment>
}
