import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'

export default class StudentBalanceTransaction extends BaseModel {
  static table = 'StudentBalanceTransaction'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column()
  declare amount: number

  @column()
  declare type: 'TOP_UP' | 'CANTEEN_PURCHASE' | 'STORE_PURCHASE' | 'REFUND' | 'ADJUSTMENT'

  @column()
  declare status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

  @column()
  declare description: string | null

  @column({ columnName: 'previousBalance' })
  declare previousBalance: number

  @column({ columnName: 'newBalance' })
  declare newBalance: number

  @column({ columnName: 'canteenPurchaseId' })
  declare canteenPurchaseId: string | null

  @column({ columnName: 'storeOrderId' })
  declare storeOrderId: string | null

  @column({ columnName: 'responsibleId' })
  declare responsibleId: string | null

  @column({ columnName: 'paymentGatewayId' })
  declare paymentGatewayId: string | null

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>
}
