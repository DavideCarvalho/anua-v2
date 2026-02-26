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

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'type' })
  declare type: string

  @column({ columnName: 'entityType' })
  declare entityType: string

  @column({ columnName: 'entityId' })
  declare entityId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'metadata' })
  declare metadata: Record<string, unknown>

  @column({ columnName: 'processed' })
  declare processed: boolean

  @column.dateTime({ columnName: 'processedAt' })
  declare processedAt: DateTime | null

  @column({ columnName: 'error' })
  declare error: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
