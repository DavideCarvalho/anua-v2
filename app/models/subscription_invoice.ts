import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Subscription from './subscription.js'
import SubscriptionEmailNotification from './subscription_email_notification.js'

export type SubscriptionInvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 'REFUNDED'

export default class SubscriptionInvoice extends BaseModel {
  static table = 'SubscriptionInvoice'

  @beforeCreate()
  static assignId(model: SubscriptionInvoice) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare subscriptionId: string

  @column()
  declare academicPeriodId: string | null

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare activeStudents: number

  @column()
  declare amount: number

  @column()
  declare status: SubscriptionInvoiceStatus

  @column.dateTime()
  declare dueDate: DateTime

  @column.dateTime()
  declare paidAt: DateTime | null

  @column()
  declare invoiceUrl: string | null

  @column()
  declare paymentGatewayId: string | null

  @column()
  declare description: string | null

  @column()
  declare paymentMethodSnapshot: string | null

  @column()
  declare creditCardLastFourDigits: string | null

  @column()
  declare creditCardBrand: string | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Subscription, { foreignKey: 'subscriptionId' })
  declare subscription: BelongsTo<typeof Subscription>

  @hasMany(() => SubscriptionEmailNotification, { foreignKey: 'subscriptionInvoiceId' })
  declare emailNotifications: HasMany<typeof SubscriptionEmailNotification>
}
