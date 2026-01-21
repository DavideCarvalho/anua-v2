import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import StudentPayment from './student_payment.js'

export type InsuranceBillingStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export default class InsuranceBilling extends BaseModel {
  static table = 'InsuranceBilling'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column.date()
  declare period: DateTime

  @column()
  declare insuredStudentsCount: number

  @column()
  declare averageTuition: number

  @column()
  declare insurancePercentage: number

  @column()
  declare totalAmount: number

  @column()
  declare status: InsuranceBillingStatus

  @column.date()
  declare dueDate: DateTime

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare invoiceUrl: string | null

  @column()
  declare paymentGatewayId: string | null

  @column.dateTime()
  declare lastReminderSentAt: DateTime | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => StudentPayment, { foreignKey: 'insuranceBillingId' })
  declare studentPayments: HasMany<typeof StudentPayment>
}
