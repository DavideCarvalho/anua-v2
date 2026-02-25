import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenPurchase from './canteen_purchase.js'

export type CanteenMonthlyTransferStatus = 'PENDING' | 'TRANSFERRED' | 'CANCELLED'

export default class CanteenMonthlyTransfer extends BaseModel {
  static table = 'CanteenMonthlyTransfer'

  @beforeCreate()
  static assignId(model: CanteenMonthlyTransfer) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'canteenId' })
  declare canteenId: string

  @column({ columnName: 'month' })
  declare month: number

  @column({ columnName: 'year' })
  declare year: number

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number

  @column({ columnName: 'status' })
  declare status: CanteenMonthlyTransferStatus

  @column.dateTime({ columnName: 'processedAt' })
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenPurchase, { foreignKey: 'monthlyTransferId' })
  declare purchases: HasMany<typeof CanteenPurchase>
}
