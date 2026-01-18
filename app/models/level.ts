import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Course from './course.js'
import Class_ from './class.js'
import AcademicPeriod from './academic_period.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'

export default class Level extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare order: number

  @column()
  declare courseId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>

  @hasMany(() => Class_)
  declare classes: HasMany<typeof Class_>

  @hasMany(() => LevelAssignedToCourseHasAcademicPeriod)
  declare levelAssignments: HasMany<typeof LevelAssignedToCourseHasAcademicPeriod>

  // Many-to-many with AcademicPeriod through level_has_academic_periods
  @manyToMany(() => AcademicPeriod, {
    pivotTable: 'level_has_academic_periods',
    localKey: 'id',
    pivotForeignKey: 'level_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'academic_period_id',
  })
  declare academicPeriods: ManyToMany<typeof AcademicPeriod>
}
