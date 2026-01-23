import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import CourseHasAcademicPeriod from './course_has_academic_period.js'

export type AcademicPeriodSegment =
  | 'KINDERGARTEN'
  | 'ELEMENTARY'
  | 'HIGHSCHOOL'
  | 'TECHNICAL'
  | 'UNIVERSITY'
  | 'OTHER'

export default class AcademicPeriod extends BaseModel {
  static table = 'AcademicPeriod'

  @beforeCreate()
  static assignId(academicPeriod: AcademicPeriod) {
    if (!academicPeriod.id) {
      academicPeriod.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  declare slug: string

  @column.date({ columnName: 'startDate' })
  declare startDate: DateTime

  @column.date({ columnName: 'endDate' })
  declare endDate: DateTime

  @column.date({ columnName: 'enrollmentStartDate' })
  declare enrollmentStartDate: DateTime | null

  @column.date({ columnName: 'enrollmentEndDate' })
  declare enrollmentEndDate: DateTime | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'segment' })
  declare segment: AcademicPeriodSegment

  @column({ columnName: 'isClosed' })
  declare isClosed: boolean

  @column({ columnName: 'minimumGradeOverride' })
  declare minimumGradeOverride: number | null

  @column({ columnName: 'minimumAttendanceOverride' })
  declare minimumAttendanceOverride: number | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'previousAcademicPeriodId' })
  declare previousAcademicPeriodId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'previousAcademicPeriodId' })
  declare previousAcademicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => AcademicPeriod, { foreignKey: 'previousAcademicPeriodId' })
  declare nextAcademicPeriods: HasMany<typeof AcademicPeriod>

  @hasMany(() => CourseHasAcademicPeriod, { foreignKey: 'academicPeriodId' })
  declare courseAcademicPeriods: HasMany<typeof CourseHasAcademicPeriod>

  // Note: Other relationships will be added when their models are created:
  // - Assignment
  // - Calendar
  // - StudentHasAcademicPeriod
  // - Exam
}
