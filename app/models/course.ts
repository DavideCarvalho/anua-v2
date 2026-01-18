import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Level from './level.js'
import AcademicPeriod from './academic_period.js'
import CourseHasAcademicPeriod from './course_has_academic_period.js'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @hasMany(() => Level)
  declare levels: HasMany<typeof Level>

  @hasMany(() => CourseHasAcademicPeriod)
  declare courseAcademicPeriods: HasMany<typeof CourseHasAcademicPeriod>

  // Many-to-many with AcademicPeriod through course_has_academic_periods
  @manyToMany(() => AcademicPeriod, {
    pivotTable: 'course_has_academic_periods',
    localKey: 'id',
    pivotForeignKey: 'course_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'academic_period_id',
  })
  declare academicPeriods: ManyToMany<typeof AcademicPeriod>
}
