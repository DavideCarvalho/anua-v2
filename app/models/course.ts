import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, hasMany, manyToMany, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { HasMany, ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import AcademicPeriod from './academic_period.js'
import CourseHasAcademicPeriod from './course_has_academic_period.js'
import School from './school.js'
import User from './user.js'

export default class Course extends BaseModel {
  static table = 'Course'

  @beforeCreate()
  static assignId(course: Course) {
    if (!course.id) {
      course.id = uuidv7()
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

  @column()
  declare schoolId: string

  @column()
  declare version: number

  @column()
  declare coordinatorId: string | null

  @column()
  declare enrollmentMinimumAge: number | null

  @column()
  declare enrollmentMaximumAge: number | null

  @column()
  declare maxStudentsPerClass: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'coordinatorId' })
  declare coordinator: BelongsTo<typeof User>

  @hasMany(() => CourseHasAcademicPeriod, { foreignKey: 'courseId' })
  declare courseAcademicPeriods: HasMany<typeof CourseHasAcademicPeriod>

  // Many-to-many with AcademicPeriod through CourseHasAcademicPeriod
  @manyToMany(() => AcademicPeriod, {
    pivotTable: 'CourseHasAcademicPeriod',
    localKey: 'id',
    pivotForeignKey: 'course_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'academic_period_id',
  })
  declare academicPeriods: ManyToMany<typeof AcademicPeriod>
}
