import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenItemPurchased from './canteen_item_purchased.js'

export default class CanteenItem extends BaseModel {
  static table = 'CanteenItem'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: number

  @column()
  declare category: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenItemPurchased, { foreignKey: 'canteenItemId' })
  declare purchasedItems: HasMany<typeof CanteenItemPurchased>
}
