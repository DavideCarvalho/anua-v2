import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Assignment from './assignment.js'
import User from './user.js'
import type { FieldDiff } from '#services/history/build_field_diff'

export default class AssignmentHistory extends BaseModel {
  static table = 'assignment_histories'

  @beforeCreate()
  static assignId(model: AssignmentHistory) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare assignmentId: string

  @column()
  declare actorUserId: string

  @column.dateTime()
  declare changedAt: DateTime

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare changes: FieldDiff[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Assignment, { foreignKey: 'assignmentId' })
  declare assignment: BelongsTo<typeof Assignment>

  @belongsTo(() => User, { foreignKey: 'actorUserId' })
  declare actorUser: BelongsTo<typeof User>
}
