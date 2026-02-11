import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import TeacherHasClass from './teacher_has_class.js'
import ResponsibleUserAcceptedOccurence from './responsible_user_accepted_occurence.js'

export type OccurenceType = 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'OTHER'

export default class Occurrence extends BaseModel {
  static table = 'Occurence'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare teacherHasClassId: string

  @column()
  declare type: OccurenceType

  @column()
  declare text: string

  @column.date()
  declare date: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>

  @hasMany(() => ResponsibleUserAcceptedOccurence, { foreignKey: 'occurenceId' })
  declare acknowledgements: HasMany<typeof ResponsibleUserAcceptedOccurence>
}
