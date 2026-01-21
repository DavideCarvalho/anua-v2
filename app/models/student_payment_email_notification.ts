import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentPayment from './student_payment.js'

export default class StudentPaymentEmailNotification extends BaseModel {
  static table = 'StudentPaymentEmailNotification'

  @beforeCreate()
  static assignId(model: StudentPaymentEmailNotification) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentPaymentId: string

  @column()
  declare emailType: string

  @column()
  declare recipients: Record<string, unknown>

  @column()
  declare daysOverdue: number | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare sentAt: DateTime

  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>
}
