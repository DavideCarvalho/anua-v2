import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Level from './level.js'
import CourseHasAcademicPeriod from './course_has_academic_period.js'
import StudentHasLevel from './student_has_level.js'

export default class LevelAssignedToCourseHasAcademicPeriod extends BaseModel {
  @beforeCreate()
  static assignId(model: LevelAssignedToCourseHasAcademicPeriod) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  static table = 'level_assigned_to_course_has_academic_periods'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare levelId: string

  @column()
  declare courseHasAcademicPeriodId: string

  @column()
  declare isActive: boolean

  @belongsTo(() => Level)
  declare level: BelongsTo<typeof Level>

  @belongsTo(() => CourseHasAcademicPeriod)
  declare courseHasAcademicPeriod: BelongsTo<typeof CourseHasAcademicPeriod>

  @hasMany(() => StudentHasLevel)
  declare studentLevels: HasMany<typeof StudentHasLevel>
}
