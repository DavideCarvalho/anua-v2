import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentGamification from './student_gamification.js'

export type TransactionType = 'EARN' | 'SPEND' | 'ADJUSTMENT' | 'EXPIRY'

export default class PointTransaction extends BaseModel {
  static table = 'PointTransaction'

  @beforeCreate()
  static assignId(model: PointTransaction) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentGamificationId: string

  @column()
  declare points: number

  @column()
  declare balanceAfter: number

  @column()
  declare type: TransactionType

  @column()
  declare reason: string | null

  @column()
  declare relatedEntityType: string | null

  @column()
  declare relatedEntityId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => StudentGamification, { foreignKey: 'studentGamificationId' })
  declare studentGamification: BelongsTo<typeof StudentGamification>
}
