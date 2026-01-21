import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'

export default class CoordinatorHasLevel extends BaseModel {
  static table = 'CoordinatorHasLevel'

  @beforeCreate()
  static assignId(model: CoordinatorHasLevel) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare coordinatorId: string

  @column()
  declare levelAssignedToCourseHasAcademicPeriodId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'coordinatorId' })
  declare coordinator: BelongsTo<typeof User>

  @belongsTo(() => LevelAssignedToCourseHasAcademicPeriod, { foreignKey: 'levelAssignedToCourseHasAcademicPeriodId' })
  declare levelAssignedToCourseHasAcademicPeriod: BelongsTo<typeof LevelAssignedToCourseHasAcademicPeriod>
}
