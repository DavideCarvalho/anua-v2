import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import User from './user.js'
import CanteenItemPurchased from './canteen_item_purchased.js'
import CanteenMonthlyTransfer from './canteen_monthly_transfer.js'
import StudentPayment from './student_payment.js'

export type CanteenPaymentMethod = 'BALANCE' | 'CASH' | 'CARD' | 'PIX'
export type CanteenPurchaseStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export default class CanteenPurchase extends BaseModel {
  static table = 'CanteenPurchase'

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
  declare studentPaymentId: string | null

  @column()
  declare monthlyTransferId: string | null

  @belongsTo(() => CanteenMonthlyTransfer, { foreignKey: 'monthlyTransferId' })
  declare monthlyTransfer: BelongsTo<typeof CanteenMonthlyTransfer>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>

  @hasMany(() => CanteenItemPurchased, { foreignKey: 'canteenPurchaseId' })
  declare itemsPurchased: HasMany<typeof CanteenItemPurchased>
}
