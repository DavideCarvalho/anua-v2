import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentPayment from './student_payment.js'
import User from './user.js'

export type InsuranceClaimStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'

export default class InsuranceClaim extends BaseModel {
  static table = 'InsuranceClaim'

  @beforeCreate()
  static assignId(model: InsuranceClaim) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentPaymentId: string

  @column.date()
  declare claimDate: DateTime

  @column()
  declare overdueAmount: number

  @column()
  declare coveragePercentage: number

  @column()
  declare coveredAmount: number

  @column()
  declare status: InsuranceClaimStatus

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column()
  declare approvedBy: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column()
  declare rejectedBy: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approvedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'rejectedBy' })
  declare rejectedByUser: BelongsTo<typeof User>
}
