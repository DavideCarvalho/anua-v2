import { BaseModelDto } from '@adocasts.com/dto/base'
import type SubscriptionStatusHistory from '#models/subscription_status_history'

export default class SubscriptionStatusHistoryDto extends BaseModelDto {
  declare id: string
  declare subscriptionId: string
  declare fromStatus: string | null
  declare toStatus: string
  declare reason: string | null
  declare changedAt: Date

  constructor(subscriptionStatusHistory?: SubscriptionStatusHistory) {
    super()

    if (!subscriptionStatusHistory) return

    this.id = subscriptionStatusHistory.id
    this.subscriptionId = subscriptionStatusHistory.subscriptionId
    this.fromStatus = subscriptionStatusHistory.fromStatus
    this.toStatus = subscriptionStatusHistory.toStatus
    this.reason = subscriptionStatusHistory.reason
    this.changedAt = subscriptionStatusHistory.changedAt.toJSDate()
  }
}
