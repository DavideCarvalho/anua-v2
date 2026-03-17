import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CanteenPurchase from './canteen_purchase.js'
import CanteenItem from './canteen_item.js'
import CanteenMeal from './canteen_meal.js'

export default class CanteenItemPurchased extends BaseModel {
  static table = 'CanteenItemPurchased'

  @beforeCreate()
  static assignId(model: CanteenItemPurchased) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'canteenPurchaseId' })
  declare canteenPurchaseId: string

  @column({ columnName: 'canteenItemId' })
  declare canteenItemId: string | null

  @column({ columnName: 'canteenMealId' })
  declare canteenMealId: string | null

  @column({ columnName: 'quantity' })
  declare quantity: number

  @column({ columnName: 'price' })
  declare price: number

  get unitPrice(): number {
    return this.price
  }

  get totalPrice(): number {
    return this.price * this.quantity
  }

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => CanteenPurchase, { foreignKey: 'canteenPurchaseId' })
  declare purchase: BelongsTo<typeof CanteenPurchase>

  @belongsTo(() => CanteenItem, { foreignKey: 'canteenItemId' })
  declare item: BelongsTo<typeof CanteenItem>

  @belongsTo(() => CanteenMeal, { foreignKey: 'canteenMealId' })
  declare meal: BelongsTo<typeof CanteenMeal>
}
