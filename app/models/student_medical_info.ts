import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import StudentMedication from './student_medication.js'

export default class StudentMedicalInfo extends BaseModel {
  static table = 'StudentMedicalInfo'

  @beforeCreate()
  static assignId(model: StudentMedicalInfo) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'conditions' })
  declare conditions: string | null

  @column({
    columnName: 'documents',
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare documents: Array<{ name: string; url: string }> | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @hasMany(() => StudentMedication, { foreignKey: 'medicalInfoId' })
  declare medications: HasMany<typeof StudentMedication>
}
