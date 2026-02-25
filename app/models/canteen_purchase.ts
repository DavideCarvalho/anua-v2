import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import User from './user.js'
import CanteenItemPurchased from './canteen_item_purchased.js'
import CanteenMonthlyTransfer from './canteen_monthly_transfer.js'
import StudentPayment from './student_payment.js'

export type CanteenPaymentMethod = 'BALANCE' | 'CASH' | 'CARD' | 'PIX' | 'ON_ACCOUNT'
export type CanteenPurchaseStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export default class CanteenPurchase extends BaseModel {
  static table = 'CanteenPurchase'

  @beforeCreate()
  static assignId(model: CanteenPurchase) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'canteenId' })
  declare canteenId: string

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number // Em centavos

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: CanteenPaymentMethod

  @column({ columnName: 'status' })
  declare status: CanteenPurchaseStatus

  @column.dateTime({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column({ columnName: 'studentPaymentId' })
  declare studentPaymentId: string | null

  @column({ columnName: 'monthlyTransferId' })
  declare monthlyTransferId: string | null

  @belongsTo(() => CanteenMonthlyTransfer, { foreignKey: 'monthlyTransferId' })
  declare monthlyTransfer: BelongsTo<typeof CanteenMonthlyTransfer>

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
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
