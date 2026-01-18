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
  declare enrollmentValue: number | null // Valor da matrícula em centavos

  @column()
  declare amount: number // Valor do curso em centavos

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

  // Relacionamentos
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => ContractDocument)
  declare contractDocuments: HasMany<typeof ContractDocument>

  @hasMany(() => ContractPaymentDay)
  declare paymentDays: HasMany<typeof ContractPaymentDay>

  @hasOne(() => ContractInterestConfig)
  declare interestConfig: HasOne<typeof ContractInterestConfig>

  @hasMany(() => ContractEarlyDiscount)
  declare earlyDiscounts: HasMany<typeof ContractEarlyDiscount>

  @hasMany(() => StudentHasLevel)
  declare studentHasLevels: HasMany<typeof StudentHasLevel>
}
