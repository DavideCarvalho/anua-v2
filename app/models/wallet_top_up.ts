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

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'responsibleUserId' })
  declare responsibleUserId: string

  @column({ columnName: 'amount' })
  declare amount: number

  @column({ columnName: 'status' })
  declare status: WalletTopUpStatus

  @column({ columnName: 'paymentGateway' })
  declare paymentGateway: string

  @column({ columnName: 'paymentGatewayId' })
  declare paymentGatewayId: string | null

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: string | null

  @column.dateTime({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleUserId' })
  declare responsible: BelongsTo<typeof User>
}
