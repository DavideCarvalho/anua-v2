import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import ContractDocument from './contract_document.js'
import ContractPaymentDay from './contract_payment_day.js'
import ContractInterestConfig from './contract_interest_config.js'
import ContractEarlyDiscount from './contract_early_discount.js'
import StudentHasLevel from './student_has_level.js'

export type ContractPaymentType = 'MONTHLY' | 'UPFRONT'

export default class Contract extends BaseModel {
  static table = 'Contract'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare academicPeriodId: string | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare enrollmentValue: number | null

  @column()
  declare ammount: number // Note: typo in DB schema

  @column()
  declare docusealTemplateId: string | null

  @column()
  declare paymentType: ContractPaymentType

  @column()
  declare enrollmentValueInstallments: number

  @column()
  declare enrollmentPaymentUntilDays: number | null

  @column()
  declare installments: number

  @column()
  declare flexibleInstallments: boolean

  @column()
  declare isActive: boolean

  @column()
  declare hasInsurance: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => ContractDocument, { foreignKey: 'contractId' })
  declare contractDocuments: HasMany<typeof ContractDocument>

  @hasMany(() => ContractPaymentDay, { foreignKey: 'contractId' })
  declare paymentDays: HasMany<typeof ContractPaymentDay>

  @hasOne(() => ContractInterestConfig, { foreignKey: 'contractId' })
  declare interestConfig: HasOne<typeof ContractInterestConfig>

  @hasMany(() => ContractEarlyDiscount, { foreignKey: 'contractId' })
  declare earlyDiscounts: HasMany<typeof ContractEarlyDiscount>

  @hasMany(() => StudentHasLevel, { foreignKey: 'contractId' })
  declare studentHasLevels: HasMany<typeof StudentHasLevel>
}
