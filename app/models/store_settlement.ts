import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import User from './user.js'
import StoreOrder from './store_order.js'

export type StoreSettlementStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'TRANSFERRED'
  | 'FAILED'
  | 'CANCELLED'

export default class StoreSettlement extends BaseModel {
  static table = 'StoreSettlement'

  @beforeCreate()
  static assignId(model: StoreSettlement) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare totalSalesAmount: number

  @column()
  declare commissionAmount: number

  @column()
  declare platformFeeAmount: number

  @column()
  declare transferAmount: number

  @column()
  declare status: StoreSettlementStatus

  @column()
  declare approvedBy: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column()
  declare pixTransactionId: string | null

  @column()
  declare failureReason: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Store, { foreignKey: 'storeId' })
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @hasMany(() => StoreOrder, { foreignKey: 'settlementId' })
  declare orders: HasMany<typeof StoreOrder>
}
