import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class GamificationEvent extends BaseModel {
  static table = 'GamificationEvent'

  @beforeCreate()
  static assignId(model: GamificationEvent) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string

  @column()
  declare entityType: string

  @column()
  declare entityId: string

  @column()
  declare studentId: string

  @column()
  declare metadata: Record<string, unknown>

  @column()
  declare processed: boolean

  @column.dateTime()
  declare processedAt: DateTime | null

  @column()
  declare error: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
