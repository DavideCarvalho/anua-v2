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

  static table = 'LevelAssignedToCourseHasAcademicPeriod'

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'levelId' })
  declare levelId: string

  @column({ columnName: 'courseHasAcademicPeriodId' })
  declare courseHasAcademicPeriodId: string

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @belongsTo(() => Level, { foreignKey: 'levelId' })
  declare level: BelongsTo<typeof Level>

  @belongsTo(() => CourseHasAcademicPeriod, { foreignKey: 'courseHasAcademicPeriodId' })
  declare courseHasAcademicPeriod: BelongsTo<typeof CourseHasAcademicPeriod>

  @hasMany(() => StudentHasLevel, { foreignKey: 'levelAssignedToCourseHasAcademicPeriodId' })
  declare studentLevels: HasMany<typeof StudentHasLevel>
}
