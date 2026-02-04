import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'

export type WalletTopUpStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export default class WalletTopUp extends BaseModel {
  static table = 'WalletTopUp'

  @beforeCreate()
  static assignId(model: WalletTopUp) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare responsibleUserId: string

  @column()
  declare amount: number

  @column()
  declare status: WalletTopUpStatus

  @column()
  declare paymentGateway: string

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare paymentMethod: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleUserId' })
  declare responsible: BelongsTo<typeof User>
}
