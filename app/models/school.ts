import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import SchoolChain from './school_chain.js'
import User from './user.js'
import SchoolGroup from './school_group.js'
import UserHasSchool from './user_has_school.js'
import InsuranceBilling from './insurance_billing.js'

export type PaymentConfigStatus =
  | 'NOT_CONFIGURED'
  | 'PENDING_DOCUMENTS'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REJECTED'

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'

export default class School extends BaseModel {
  static table = 'School'

  @beforeCreate()
  static assignId(model: School) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  declare slug: string

  // Address
  @column({ columnName: 'street' })
  declare street: string | null

  @column({ columnName: 'number' })
  declare number: string | null

  @column({ columnName: 'complement' })
  declare complement: string | null

  @column({ columnName: 'neighborhood' })
  declare neighborhood: string | null

  @column({ columnName: 'city' })
  declare city: string | null

  @column({ columnName: 'state' })
  declare state: string | null

  @column({ columnName: 'zipCode' })
  declare zipCode: string | null

  @column({ columnName: 'latitude' })
  declare latitude: number | null

  @column({ columnName: 'longitude' })
  declare longitude: number | null

  // PostGIS geometry point - stored as USER-DEFINED type in DB
  // Use raw queries for spatial operations
  @column({ columnName: 'location' })
  declare location: unknown | null

  // Logo
  @column({ columnName: 'logoUrl' })
  declare logoUrl: string | null

  // Asaas integration
  @column({ columnName: 'asaasAccountId' })
  declare asaasAccountId: string | null

  @column({ columnName: 'asaasWebhookToken' })
  declare asaasWebhookToken: string | null

  @column({ columnName: 'asaasWalletId' })
  declare asaasWalletId: string | null

  @column({ serializeAs: null, columnName: 'asaasApiKey' })
  declare asaasApiKey: string | null

  @column({ columnName: 'asaasDocumentUrl' })
  declare asaasDocumentUrl: string | null

  @column({ columnName: 'asaasCommercialInfoIsExpired' })
  declare asaasCommercialInfoIsExpired: boolean | null

  @column.dateTime({ columnName: 'asaasCommercialInfoScheduledDate' })
  declare asaasCommercialInfoScheduledDate: DateTime | null

  // Payment config
  @column({ columnName: 'paymentConfigStatus' })
  declare paymentConfigStatus: PaymentConfigStatus

  @column.dateTime({ columnName: 'paymentConfigStatusUpdatedAt' })
  declare paymentConfigStatusUpdatedAt: DateTime | null

  @column({ columnName: 'pixKey' })
  declare pixKey: string | null

  @column({ columnName: 'pixKeyType' })
  declare pixKeyType: PixKeyType | null

  @column({ columnName: 'usePlatformManagedPayments' })
  declare usePlatformManagedPayments: boolean

  @column({ columnName: 'enablePaymentNotifications' })
  declare enablePaymentNotifications: boolean

  // Academic settings
  @column({ columnName: 'minimumGrade' })
  declare minimumGrade: number

  @column({ columnName: 'calculationAlgorithm' })
  declare calculationAlgorithm: string

  @column({ columnName: 'minimumAttendancePercentage' })
  declare minimumAttendancePercentage: number

  // Insurance config
  @column({ columnName: 'hasInsurance' })
  declare hasInsurance: boolean | null

  @column({ columnName: 'insurancePercentage' })
  declare insurancePercentage: number | null

  @column({ columnName: 'insuranceCoveragePercentage' })
  declare insuranceCoveragePercentage: number | null

  @column({ columnName: 'insuranceClaimWaitingDays' })
  declare insuranceClaimWaitingDays: number | null

  // Foreign keys
  @column({ columnName: 'schoolChainId' })
  declare schoolChainId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => SchoolChain, {
    foreignKey: 'schoolChainId',
  })
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @hasMany(() => UserHasSchool, {
    foreignKey: 'schoolId',
  })
  declare userHasSchools: HasMany<typeof UserHasSchool>

  @manyToMany(() => User, {
    pivotTable: 'UserHasSchool',
    localKey: 'id',
    pivotForeignKey: 'schoolId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'userId',
  })
  declare users: ManyToMany<typeof User>

  @manyToMany(() => SchoolGroup, {
    pivotTable: 'SchoolHasGroup',
    localKey: 'id',
    pivotForeignKey: 'schoolId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'schoolGroupId',
  })
  declare schoolGroups: ManyToMany<typeof SchoolGroup>

  @hasMany(() => InsuranceBilling, { foreignKey: 'schoolId' })
  declare insuranceBillings: HasMany<typeof InsuranceBilling>
}
