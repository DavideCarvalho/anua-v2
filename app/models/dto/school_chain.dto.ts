import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolChain from '#models/school_chain'
import type { SubscriptionLevel } from '#models/school_chain'

export default class SchoolChainDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare subscriptionLevel: SubscriptionLevel
  declare asaasAccountId: string | null
  declare asaasWebhookToken: string | null
  declare asaasWalletId: string | null
  declare asaasApiKey: string | null
  declare allowSchoolsToOverridePaymentConfig: boolean
  declare allowSchoolsToOverrideNotifications: boolean
  declare usePlatformManagedPayments: boolean
  declare enablePaymentNotifications: boolean
  declare hasInsuranceByDefault: boolean
  declare insurancePercentage: number | null
  declare insuranceCoveragePercentage: number | null
  declare insuranceClaimWaitingDays: number | null
  declare createdAt: Date
  declare updatedAt: Date | null

  constructor(model?: SchoolChain) {
    super()

    if (!model) return

    this.id = model.id
    this.name = model.name
    this.slug = model.slug
    this.subscriptionLevel = model.subscriptionLevel
    this.asaasAccountId = model.asaasAccountId
    this.asaasWebhookToken = model.asaasWebhookToken
    this.asaasWalletId = model.asaasWalletId
    this.asaasApiKey = model.asaasApiKey
    this.allowSchoolsToOverridePaymentConfig = model.allowSchoolsToOverridePaymentConfig
    this.allowSchoolsToOverrideNotifications = model.allowSchoolsToOverrideNotifications
    this.usePlatformManagedPayments = model.usePlatformManagedPayments
    this.enablePaymentNotifications = model.enablePaymentNotifications
    this.hasInsuranceByDefault = model.hasInsuranceByDefault
    this.insurancePercentage = model.insurancePercentage
    this.insuranceCoveragePercentage = model.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = model.insuranceClaimWaitingDays
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt ? model.updatedAt.toJSDate() : null
  }
}
