import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolGroup from './school_group.js'
import User from './user.js'

export type SubscriptionLevel = 'NETWORK' | 'INDIVIDUAL'

export default class SchoolChain extends BaseModel {
  static table = 'SchoolChain'

  @beforeCreate()
  static assignId(model: SchoolChain) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare subscriptionLevel: SubscriptionLevel

  // Asaas integration
  @column()
  declare asaasAccountId: string | null

  @column()
  declare asaasWebhookToken: string | null

  @column()
  declare asaasWalletId: string | null

  @column({ serializeAs: null })
  declare asaasApiKey: string | null

  // Payment config
  @column()
  declare allowSchoolsToOverridePaymentConfig: boolean

  @column()
  declare allowSchoolsToOverrideNotifications: boolean

  @column()
  declare usePlatformManagedPayments: boolean

  @column()
  declare enablePaymentNotifications: boolean

  // Insurance config
  @column()
  declare hasInsuranceByDefault: boolean

  @column()
  declare insurancePercentage: number | null

  @column()
  declare insuranceCoveragePercentage: number | null

  @column()
  declare insuranceClaimWaitingDays: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @hasMany(() => School, {
    foreignKey: 'schoolChainId',
  })
  declare schools: HasMany<typeof School>

  @hasMany(() => SchoolGroup, { foreignKey: 'schoolChainId' })
  declare schoolGroups: HasMany<typeof SchoolGroup>

  @hasMany(() => User, { foreignKey: 'schoolChainId' })
  declare users: HasMany<typeof User>
}
