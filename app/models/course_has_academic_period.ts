import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Course from './course.js'
import AcademicPeriod from './academic_period.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'

export default class CourseHasAcademicPeriod extends BaseModel {
  @beforeCreate()
  static assignId(model: CourseHasAcademicPeriod) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  static table = 'course_has_academic_periods'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare courseId: string

  @column()
  declare academicPeriodId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>

  @belongsTo(() => AcademicPeriod)
  declare academicPeriod: BelongsTo<typeof AcademicPeriod>

  @hasMany(() => LevelAssignedToCourseHasAcademicPeriod)
  declare levelAssignments: HasMany<typeof LevelAssignedToCourseHasAcademicPeriod>
}
