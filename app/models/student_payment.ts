import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class StudentPayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare amount: number

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare type: 'ENROLLMENT' | 'TUITION' | 'CANTEEN' | 'COURSE' | 'AGREEMENT' | 'STUDENT_LOAN' | 'OTHER'

  @column()
  declare status: 'NOT_PAID' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'FAILED'

  @column()
  declare totalAmount: number

  @column.date()
  declare dueDate: DateTime

  @column()
  declare installments: number

  @column()
  declare installmentNumber: number

  @column()
  declare discountPercentage: number

  @column.date()
  declare paidAt: DateTime | null

  @column.dateTime()
  declare emailSentAt: DateTime | null

  @column()
  declare contractId: string

  @column()
  declare classHasAcademicPeriodId: string | null

  @column()
  declare studentHasLevelId: string | null

  @column()
  declare invoiceUrl: string | null

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column()
  declare agreementId: string | null

  @column()
  declare insuranceBillingId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
