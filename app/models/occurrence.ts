import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import TeacherHasClass from './teacher_has_class.js'
import ResponsibleUserAcceptedOccurence from './responsible_user_accepted_occurence.js'

export type OccurenceType = 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'OTHER'

export default class Occurrence extends BaseModel {
  static table = 'Occurence'

  @beforeCreate()
  static assignId(occurrence: Occurrence) {
    if (!occurrence.id) {
      occurrence.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'teacherHasClassId' })
  declare teacherHasClassId: string

  @column({ columnName: 'type' })
  declare type: OccurenceType

  @column({ columnName: 'text' })
  declare text: string

  @column.date({ columnName: 'date' })
  declare date: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>

  @hasMany(() => ResponsibleUserAcceptedOccurence, { foreignKey: 'occurenceId' })
  declare acknowledgements: HasMany<typeof ResponsibleUserAcceptedOccurence>
}
