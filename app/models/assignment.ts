import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import TeacherHasClass from './teacher_has_class.js'
import AcademicPeriod from './academic_period.js'
import StudentHasAssignment from './student_has_assignment.js'

export default class Assignment extends BaseModel {
  static table = 'Assignment'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime()
  declare dueDate: DateTime

  @column()
  declare grade: number

  @column()
  declare teacherHasClassId: string

  @column()
  declare academicPeriodId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => StudentHasAssignment, { foreignKey: 'assignmentId' })
  declare submissions: HasMany<typeof StudentHasAssignment>
}
