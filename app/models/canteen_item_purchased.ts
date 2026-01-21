import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CanteenPurchase from './canteen_purchase.js'
import CanteenItem from './canteen_item.js'

export default class CanteenItemPurchased extends BaseModel {
  static table = 'CanteenItemPurchased'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenPurchaseId: string

  @column()
  declare canteenItemId: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number // Preço unitário na hora da compra

  @column()
  declare totalPrice: number // quantity * unitPrice

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => CanteenPurchase, { foreignKey: 'canteenPurchaseId' })
  declare purchase: BelongsTo<typeof CanteenPurchase>

  @belongsTo(() => CanteenItem, { foreignKey: 'canteenItemId' })
  declare item: BelongsTo<typeof CanteenItem>
}
