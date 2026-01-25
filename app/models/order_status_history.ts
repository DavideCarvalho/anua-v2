import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from './store_order.js'
import User from './user.js'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export default class OrderStatusHistory extends BaseModel {
  static table = 'OrderStatusHistory'

  @beforeCreate()
  static assignId(model: OrderStatusHistory) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare fromStatus: OrderStatus | null

  @column()
  declare toStatus: OrderStatus

  @column()
  declare changedBy: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => StoreOrder, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof StoreOrder>

  @belongsTo(() => User, { foreignKey: 'changedBy' })
  declare changedByUser: BelongsTo<typeof User>
}
