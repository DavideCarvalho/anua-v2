import { BaseModelDto } from '@adocasts.com/dto/base'
import type Subscription from '#models/subscription'
import type { SubscriptionStatus, BillingCycle } from '#models/subscription'
import SchoolDto from './school.dto.js'
import SchoolChainDto from './school_chain.dto.js'
import SubscriptionPlanDto from './subscription_plan.dto.js'

export default class SubscriptionDto extends BaseModelDto {
  declare id: string
  declare planId: string | null
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare status: SubscriptionStatus
  declare billingCycle: BillingCycle
  declare currentPeriodStart: Date
  declare currentPeriodEnd: Date
  declare trialEndsAt: Date | null
  declare canceledAt: Date | null
  declare pausedAt: Date | null
  declare blockedAt: Date | null
  declare pricePerStudent: number
  declare activeStudents: number
  declare monthlyAmount: number
  declare discount: number
  declare paymentGatewayId: string | null
  declare paymentMethod: string | null
  declare creditCardHolderName: string | null
  declare creditCardLastFourDigits: string | null
  declare creditCardBrand: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare school?: SchoolDto
  declare schoolChain?: SchoolChainDto
  declare plan?: SubscriptionPlanDto

  constructor(subscription?: Subscription) {
    super()

    if (!subscription) return

    this.id = subscription.id
    this.planId = subscription.planId
    this.schoolId = subscription.schoolId
    this.schoolChainId = subscription.schoolChainId
    this.status = subscription.status
    this.billingCycle = subscription.billingCycle
    this.currentPeriodStart = subscription.currentPeriodStart.toJSDate()
    this.currentPeriodEnd = subscription.currentPeriodEnd.toJSDate()
    this.trialEndsAt = subscription.trialEndsAt ? subscription.trialEndsAt.toJSDate() : null
    this.canceledAt = subscription.canceledAt ? subscription.canceledAt.toJSDate() : null
    this.pausedAt = subscription.pausedAt ? subscription.pausedAt.toJSDate() : null
    this.blockedAt = subscription.blockedAt ? subscription.blockedAt.toJSDate() : null
    this.pricePerStudent = subscription.pricePerStudent
    this.activeStudents = subscription.activeStudents
    this.monthlyAmount = subscription.monthlyAmount
    this.discount = subscription.discount
    this.paymentGatewayId = subscription.paymentGatewayId
    this.paymentMethod = subscription.paymentMethod
    this.creditCardHolderName = subscription.creditCardHolderName
    this.creditCardLastFourDigits = subscription.creditCardLastFourDigits
    this.creditCardBrand = subscription.creditCardBrand
    this.createdAt = subscription.createdAt.toJSDate()
    this.updatedAt = subscription.updatedAt.toJSDate()
    this.school = subscription.school ? new SchoolDto(subscription.school) : undefined
    this.schoolChain = subscription.schoolChain
      ? new SchoolChainDto(subscription.schoolChain)
      : undefined
    this.plan = subscription.plan ? new SubscriptionPlanDto(subscription.plan) : undefined
  }
}
