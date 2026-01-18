import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import SchoolChain from './school_chain.js'
import User from './user.js'
import SchoolGroup from './school_group.js'
import UserHasSchool from './user_has_school.js'

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
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  // Address
  @column()
  declare street: string | null

  @column()
  declare number: string | null

  @column()
  declare complement: string | null

  @column()
  declare neighborhood: string | null

  @column()
  declare city: string | null

  @column()
  declare state: string | null

  @column()
  declare zipCode: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  // Logo
  @column()
  declare logoUrl: string | null

  // Asaas integration
  @column()
  declare asaasAccountId: string | null

  @column()
  declare asaasWebhookToken: string | null

  @column()
  declare asaasWalletId: string | null

  @column({ serializeAs: null })
  declare asaasApiKey: string | null

  @column()
  declare asaasDocumentUrl: string | null

  @column()
  declare asaasCommercialInfoIsExpired: boolean | null

  @column.dateTime()
  declare asaasCommercialInfoScheduledDate: DateTime | null

  // Payment config
  @column()
  declare paymentConfigStatus: PaymentConfigStatus

  @column.dateTime()
  declare paymentConfigStatusUpdatedAt: DateTime | null

  @column()
  declare pixKey: string | null

  @column()
  declare pixKeyType: PixKeyType | null

  @column()
  declare usePlatformManagedPayments: boolean

  @column()
  declare enablePaymentNotifications: boolean

  // Academic settings
  @column()
  declare minimumGrade: number

  @column()
  declare calculationAlgorithm: string

  @column()
  declare minimumAttendancePercentage: number

  // Insurance config
  @column()
  declare hasInsurance: boolean | null

  @column()
  declare insurancePercentage: number | null

  @column()
  declare insuranceCoveragePercentage: number | null

  @column()
  declare insuranceClaimWaitingDays: number | null

  // Foreign keys
  @column()
  declare schoolChainId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => SchoolChain)
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => UserHasSchool)
  declare userHasSchools: HasMany<typeof UserHasSchool>

  @manyToMany(() => SchoolGroup, {
    pivotTable: 'school_has_groups',
    localKey: 'id',
    pivotForeignKey: 'school_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'school_group_id',
  })
  declare schoolGroups: ManyToMany<typeof SchoolGroup>
}
