import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from './store_order.js'
import StoreItem from './store_item.js'

export type PaymentMode = 'POINTS' | 'MONEY' | 'MIXED'

export default class StoreOrderItem extends BaseModel {
  static table = 'StoreOrderItem'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: string

  @column()
  declare storeItemId: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare paymentMode: PaymentMode

  @column()
  declare pointsToMoneyRate: number

  @column()
  declare pointsPaid: number

  @column()
  declare moneyPaid: number

  @column()
  declare itemName: string

  @column()
  declare itemDescription: string | null

  @column()
  declare itemImageUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => StoreOrder, { foreignKey: 'orderId' })
  declare storeOrder: BelongsTo<typeof StoreOrder>

  @belongsTo(() => StoreItem, { foreignKey: 'storeItemId' })
  declare storeItem: BelongsTo<typeof StoreItem>
}
