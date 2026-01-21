import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Subscription from './subscription.js'

export default class SubscriptionStatusHistory extends BaseModel {
  static table = 'SubscriptionStatusHistory'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare subscriptionId: string

  @column()
  declare fromStatus: string | null

  @column()
  declare toStatus: string

  @column()
  declare reason: string | null

  @column.dateTime()
  declare changedAt: DateTime

  // Relationships
  @belongsTo(() => Subscription, { foreignKey: 'subscriptionId' })
  declare subscription: BelongsTo<typeof Subscription>
}
