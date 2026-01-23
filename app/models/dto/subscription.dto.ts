import { BaseModelDto } from '@adocasts.com/dto/base'
import type Subscription from '#models/subscription'
import type { SubscriptionStatus, BillingCycle } from '#models/subscription'
import type { DateTime } from 'luxon'

export default class SubscriptionDto extends BaseModelDto {
  declare id: string
  declare planId: string | null
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare status: SubscriptionStatus
  declare billingCycle: BillingCycle
  declare currentPeriodStart: DateTime
  declare currentPeriodEnd: DateTime
  declare trialEndsAt: DateTime | null
  declare canceledAt: DateTime | null
  declare pausedAt: DateTime | null
  declare blockedAt: DateTime | null
  declare pricePerStudent: number
  declare activeStudents: number
  declare monthlyAmount: number
  declare discount: number
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare creditCardHolderName: string | null
  declare creditCardLastFourDigits: string | null
  declare creditCardBrand: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(subscription?: Subscription) {
    super()

    if (!subscription) return

    this.id = subscription.id
    this.planId = subscription.planId
    this.schoolId = subscription.schoolId
    this.schoolChainId = subscription.schoolChainId
    this.status = subscription.status
    this.billingCycle = subscription.billingCycle
    this.currentPeriodStart = subscription.currentPeriodStart
    this.currentPeriodEnd = subscription.currentPeriodEnd
    this.trialEndsAt = subscription.trialEndsAt
    this.canceledAt = subscription.canceledAt
    this.pausedAt = subscription.pausedAt
    this.blockedAt = subscription.blockedAt
    this.pricePerStudent = subscription.pricePerStudent
    this.activeStudents = subscription.activeStudents
    this.monthlyAmount = subscription.monthlyAmount
    this.discount = subscription.discount
    this.paymentGatewayId = subscription.paymentGatewayId
    this.paymentMethod = subscription.paymentMethod
    this.creditCardHolderName = subscription.creditCardHolderName
    this.creditCardLastFourDigits = subscription.creditCardLastFourDigits
    this.creditCardBrand = subscription.creditCardBrand
    this.createdAt = subscription.createdAt
    this.updatedAt = subscription.updatedAt
  }
}
