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

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'academicPeriodId' })
  declare academicPeriodId: string | null

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column.date({ columnName: 'endDate' })
  declare endDate: DateTime | null

  @column({ columnName: 'enrollmentValue' })
  declare enrollmentValue: number | null

  @column({ columnName: 'ammount' })
  declare ammount: number // Note: typo in DB schema

  @column({ columnName: 'docusealTemplateId' })
  declare docusealTemplateId: string | null

  @column({ columnName: 'paymentType' })
  declare paymentType: ContractPaymentType

  @column({ columnName: 'enrollmentValueInstallments' })
  declare enrollmentValueInstallments: number

  @column({ columnName: 'enrollmentPaymentUntilDays' })
  declare enrollmentPaymentUntilDays: number | null

  @column({ columnName: 'installments' })
  declare installments: number

  @column({ columnName: 'flexibleInstallments' })
  declare flexibleInstallments: boolean

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'hasInsurance' })
  declare hasInsurance: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
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
