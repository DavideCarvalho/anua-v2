import { BaseModelDto } from '@adocasts.com/dto/base'
import type SubscriptionPlan from '#models/subscription_plan'
import type { SubscriptionTier } from '#models/subscription_plan'
import type { DateTime } from 'luxon'

export default class SubscriptionPlanDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare tier: SubscriptionTier
  declare description: string | null
  declare monthlyPrice: number
  declare annualPrice: number | null
  declare maxStudents: number | null
  declare maxTeachers: number | null
  declare maxSchoolsInChain: number | null
  declare features: Record<string, unknown>
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(subscriptionPlan?: SubscriptionPlan) {
    super()

    if (!subscriptionPlan) return

    this.id = subscriptionPlan.id
    this.name = subscriptionPlan.name
    this.tier = subscriptionPlan.tier
    this.description = subscriptionPlan.description
    this.monthlyPrice = subscriptionPlan.monthlyPrice
    this.annualPrice = subscriptionPlan.annualPrice
    this.maxStudents = subscriptionPlan.maxStudents
    this.maxTeachers = subscriptionPlan.maxTeachers
    this.maxSchoolsInChain = subscriptionPlan.maxSchoolsInChain
    this.features = subscriptionPlan.features
    this.isActive = subscriptionPlan.isActive
    this.createdAt = subscriptionPlan.createdAt.toJSDate()
    this.updatedAt = subscriptionPlan.updatedAt.toJSDate()
  }
}
