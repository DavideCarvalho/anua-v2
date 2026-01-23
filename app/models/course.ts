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

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'version' })
  declare version: number

  @column({ columnName: 'coordinatorId' })
  declare coordinatorId: string | null

  @column({ columnName: 'enrollmentMinimumAge' })
  declare enrollmentMinimumAge: number | null

  @column({ columnName: 'enrollmentMaximumAge' })
  declare enrollmentMaximumAge: number | null

  @column({ columnName: 'maxStudentsPerClass' })
  declare maxStudentsPerClass: number | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
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
    pivotForeignKey: 'courseId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'academicPeriodId',
  })
  declare academicPeriods: ManyToMany<typeof AcademicPeriod>
}
