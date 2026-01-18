import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenPurchase from './canteen_purchase.js'

export type CanteenMonthlyTransferStatus = 'PENDING' | 'TRANSFERRED' | 'CANCELLED'

export default class CanteenMonthlyTransfer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenId: string

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare totalAmount: number

  @column()
  declare status: CanteenMonthlyTransferStatus

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen)
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenPurchase, { foreignKey: 'monthlyTransferId' })
  declare purchases: HasMany<typeof CanteenPurchase>
}
