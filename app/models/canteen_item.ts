import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenItemPurchased from './canteen_item_purchased.js'

export default class CanteenItem extends BaseModel {
  static table = 'CanteenItem'

  @beforeCreate()
  static assignId(model: CanteenItem) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'canteenId' })
  declare canteenId: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'price' })
  declare price: number

  @column({ columnName: 'category' })
  declare category: string | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @attachment<CanteenItem>({
    folder: (record) => `canteen-items/${record.canteenId}`,
    preComputeUrl: true,
  })
  declare image: Attachment | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenItemPurchased, { foreignKey: 'canteenItemId' })
  declare purchasedItems: HasMany<typeof CanteenItemPurchased>
}
