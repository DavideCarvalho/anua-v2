import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SubscriptionInvoice from './subscription_invoice.js'

export default class SubscriptionEmailNotification extends BaseModel {
  static table = 'SubscriptionEmailNotification'

  @beforeCreate()
  static assignId(model: SubscriptionEmailNotification) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

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
  @belongsTo(() => SubscriptionInvoice, { foreignKey: 'subscriptionInvoiceId' })
  declare subscriptionInvoice: BelongsTo<typeof SubscriptionInvoice>
}
