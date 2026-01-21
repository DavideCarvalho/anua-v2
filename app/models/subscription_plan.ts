import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Subscription from './subscription.js'

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'

export default class SubscriptionPlan extends BaseModel {
  static table = 'SubscriptionPlan'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare tier: SubscriptionTier

  @column()
  declare description: string | null

  @column()
  declare monthlyPrice: number

  @column()
  declare annualPrice: number | null

  @column()
  declare maxStudents: number | null

  @column()
  declare maxTeachers: number | null

  @column()
  declare maxSchoolsInChain: number | null

  @column()
  declare features: Record<string, unknown>

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => Subscription, { foreignKey: 'planId' })
  declare subscriptions: HasMany<typeof Subscription>
}
