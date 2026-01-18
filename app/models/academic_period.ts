import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
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
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
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
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => AcademicPeriod, { foreignKey: 'previousAcademicPeriodId' })
  declare previousAcademicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => AcademicPeriod, { foreignKey: 'previousAcademicPeriodId' })
  declare nextAcademicPeriods: HasMany<typeof AcademicPeriod>

  @hasMany(() => CourseHasAcademicPeriod)
  declare courseAcademicPeriods: HasMany<typeof CourseHasAcademicPeriod>

  // Note: Other relationships will be added when their models are created:
  // - Assignment
  // - Calendar
  // - StudentHasAcademicPeriod
  // - Exam
}
