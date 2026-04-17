import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import TeacherHasClass from './teacher_has_class.js'
import AcademicPeriod from './academic_period.js'
import StudentHasAssignment from './student_has_assignment.js'
import AcademicSubPeriod from './academic_sub_period.js'

export default class Assignment extends BaseModel {
  static table = 'Assignment'

  @beforeCreate()
  static assignId(model: Assignment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column.dateTime({ columnName: 'dueDate' })
  declare dueDate: DateTime

  @column({ columnName: 'grade' })
  declare grade: number | null

  @column({ columnName: 'teacherHasClassId' })
  declare teacherHasClassId: string

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string

  @column({ columnName: 'subPeriodId' })
  declare subPeriodId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @belongsTo(() => AcademicSubPeriod, { foreignKey: 'subPeriodId' })
  declare subPeriod: BelongsTo<typeof AcademicSubPeriod> | null

  @hasMany(() => StudentHasAssignment, { foreignKey: 'assignmentId' })
  declare submissions: HasMany<typeof StudentHasAssignment>
}
