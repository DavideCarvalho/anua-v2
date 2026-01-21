import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SubscriptionPlan from './subscription_plan.js'
import School from './school.js'
import SchoolChain from './school_chain.js'
import SubscriptionInvoice from './subscription_invoice.js'
import SubscriptionStatusHistory from './subscription_status_history.js'

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'BLOCKED' | 'CANCELED' | 'PAUSED'
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL'

export default class Subscription extends BaseModel {
  static table = 'Subscription'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare planId: string | null

  @column()
  declare schoolId: string | null

  @column()
  declare schoolChainId: string | null

  @column()
  declare status: SubscriptionStatus

  @column()
  declare billingCycle: BillingCycle

  @column.dateTime()
  declare currentPeriodStart: DateTime

  @column.dateTime()
  declare currentPeriodEnd: DateTime

  @column.dateTime()
  declare trialEndsAt: DateTime | null

  @column.dateTime()
  declare canceledAt: DateTime | null

  @column.dateTime()
  declare pausedAt: DateTime | null

  @column.dateTime()
  declare blockedAt: DateTime | null

  @column()
  declare pricePerStudent: number

  @column()
  declare activeStudents: number

  @column()
  declare monthlyAmount: number

  @column()
  declare discount: number

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare paymentMethod: string | null

  @column({ serializeAs: null })
  declare creditCardToken: string | null

  @column()
  declare creditCardHolderName: string | null

  @column()
  declare creditCardLastFourDigits: string | null

  @column()
  declare creditCardBrand: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => SubscriptionPlan, { foreignKey: 'planId' })
  declare plan: BelongsTo<typeof SubscriptionPlan>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain, { foreignKey: 'schoolChainId' })
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @hasMany(() => SubscriptionInvoice, { foreignKey: 'subscriptionId' })
  declare invoices: HasMany<typeof SubscriptionInvoice>

  @hasMany(() => SubscriptionStatusHistory, { foreignKey: 'statusHistoryId' })
  declare statusHistory: HasMany<typeof SubscriptionStatusHistory>
}
