import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from './store_order.js'
import User from '../user.js'

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
  declare fromStatus:
    | 'PENDING_PAYMENT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELED'
    | 'REJECTED'
    | null

  @column()
  declare toStatus:
    | 'PENDING_PAYMENT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELED'
    | 'REJECTED'

  @column()
  declare changedBy: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => StoreOrder)
  declare order: BelongsTo<typeof StoreOrder>

  @belongsTo(() => User, { foreignKey: 'changedBy' })
  declare changedByUser: BelongsTo<typeof User>
}
