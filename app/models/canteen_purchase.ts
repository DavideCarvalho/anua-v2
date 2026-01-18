import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import User from './user.js'
import CanteenItemPurchased from './canteen_item_purchased.js'
import CanteenMonthlyTransfer from './canteen_monthly_transfer.js'

export type CanteenPaymentMethod = 'BALANCE' | 'CASH' | 'CARD' | 'PIX'
export type CanteenPurchaseStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export default class CanteenPurchase extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare canteenId: string

  @column()
  declare totalAmount: number // Em centavos

  @column()
  declare paymentMethod: CanteenPaymentMethod

  @column()
  declare status: CanteenPurchaseStatus

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare monthlyTransferId: string | null

  @belongsTo(() => CanteenMonthlyTransfer, { foreignKey: 'monthlyTransferId' })
  declare monthlyTransfer: BelongsTo<typeof CanteenMonthlyTransfer>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Canteen)
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenItemPurchased)
  declare itemsPurchased: HasMany<typeof CanteenItemPurchased>
}
