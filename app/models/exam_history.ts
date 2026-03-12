import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exam from './exam.js'
import User from './user.js'
import type { FieldDiff } from '#services/history/build_field_diff'

export default class ExamHistory extends BaseModel {
  static table = 'exam_histories'

  @beforeCreate()
  static assignId(model: ExamHistory) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare examId: string

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

  @belongsTo(() => Exam, { foreignKey: 'examId' })
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => User, { foreignKey: 'actorUserId' })
  declare actorUser: BelongsTo<typeof User>
}
