import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'

export default class StudentBalanceTransaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare amount: number

  @column()
  declare type: 'TOP_UP' | 'CANTEEN_PURCHASE' | 'STORE_PURCHASE' | 'REFUND' | 'ADJUSTMENT'

  @column()
  declare status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

  @column()
  declare description: string | null

  @column()
  declare previousBalance: number

  @column()
  declare newBalance: number

  @column()
  declare canteenPurchaseId: string | null

  @column()
  declare storeOrderId: string | null

  @column()
  declare responsibleId: string | null

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare paymentMethod: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>
}
