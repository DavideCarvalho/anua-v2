import { BaseModelDto } from '@adocasts.com/dto/base'
import type SubscriptionEmailNotification from '#models/subscription_email_notification'
import type { DateTime } from 'luxon'

export default class SubscriptionEmailNotificationDto extends BaseModelDto {
  declare id: string
  declare subscriptionInvoiceId: string
  declare emailType: string
  declare recipients: Record<string, unknown>
  declare sentAt: Date
  declare daysOverdue: number | null
  declare metadata: Record<string, unknown> | null

  constructor(subscriptionEmailNotification?: SubscriptionEmailNotification) {
    super()

    if (!subscriptionEmailNotification) return

    this.id = subscriptionEmailNotification.id
    this.subscriptionInvoiceId = subscriptionEmailNotification.subscriptionInvoiceId
    this.emailType = subscriptionEmailNotification.emailType
    this.recipients = subscriptionEmailNotification.recipients
    this.sentAt = subscriptionEmailNotification.sentAt.toJSDate()
    this.daysOverdue = subscriptionEmailNotification.daysOverdue
    this.metadata = subscriptionEmailNotification.metadata
  }
}
