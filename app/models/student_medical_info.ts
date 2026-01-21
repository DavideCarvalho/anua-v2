import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import StudentMedication from './student_medication.js'

export default class StudentMedicalInfo extends BaseModel {
  static table = 'StudentMedicalInfo'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare conditions: string | null

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare documents: Array<{ name: string; url: string }> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @hasMany(() => StudentMedication, { foreignKey: 'medicalInfoId' })
  declare medications: HasMany<typeof StudentMedication>
}
