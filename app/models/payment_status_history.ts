import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentPayment from './student_payment.js'
import User from './user.js'

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'

export default class PaymentStatusHistory extends BaseModel {
  static table = 'PaymentStatusHistory'

  @beforeCreate()
  static assignId(model: PaymentStatusHistory) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare paymentId: string

  @column()
  declare previousStatus: PaymentStatus

  @column()
  declare newStatus: PaymentStatus

  @column()
  declare changedBy: string

  @column()
  declare observation: string | null

  @column.dateTime({ autoCreate: true })
  declare changedAt: DateTime

  @belongsTo(() => StudentPayment, { foreignKey: 'paymentId' })
  declare payment: BelongsTo<typeof StudentPayment>

  @belongsTo(() => User, { foreignKey: 'changedBy' })
  declare changedByUser: BelongsTo<typeof User>
}
