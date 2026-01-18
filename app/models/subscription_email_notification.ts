import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SubscriptionInvoice from './subscription_invoice.js'

export default class SubscriptionEmailNotification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare subscriptionInvoiceId: string

  @column()
  declare emailType: string

  @column()
  declare recipients: Record<string, unknown>

  @column.dateTime()
  declare sentAt: DateTime

  @column()
  declare daysOverdue: number | null

  @column()
  declare metadata: Record<string, unknown> | null

  // Relationships
  @belongsTo(() => SubscriptionInvoice)
  declare subscriptionInvoice: BelongsTo<typeof SubscriptionInvoice>
}
