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

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  declare slug: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column.date()
  declare enrollmentStartDate: DateTime | null

  @column.date()
  declare enrollmentEndDate: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare segment: AcademicPeriodSegment

  @column()
  declare isClosed: boolean

  @column()
  declare minimumGradeOverride: number | null

  @column()
  declare minimumAttendanceOverride: number | null

  @column()
  declare schoolId: string

  @column()
  declare previousAcademicPeriodId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
