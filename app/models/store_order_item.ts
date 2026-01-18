import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from './store_order.js'
import StoreItem from './store_item.js'

export default class StoreOrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeOrderId: string

  @column()
  declare storeItemId: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare totalPrice: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => StoreOrder)
  declare storeOrder: BelongsTo<typeof StoreOrder>

  @belongsTo(() => StoreItem)
  declare storeItem: BelongsTo<typeof StoreItem>
}
