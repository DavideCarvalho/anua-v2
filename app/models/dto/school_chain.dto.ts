import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolChain from '#models/school_chain'
import type { SubscriptionLevel } from '#models/school_chain'
import type { DateTime } from 'luxon'

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
  declare nfseEnabled: boolean
  declare nfseMunicipalServiceCode: string | null
  declare nfseMunicipalServiceName: string | null
  declare nfseIssPercentage: number | null
  declare nfseCofinsPercentage: number | null
  declare nfsePisPercentage: number | null
  declare nfseCsllPercentage: number | null
  declare nfseInssPercentage: number | null
  declare nfseIrPercentage: number | null
  declare nfseDeductions: number | null
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
    this.nfseEnabled = model.nfseEnabled
    this.nfseMunicipalServiceCode = model.nfseMunicipalServiceCode
    this.nfseMunicipalServiceName = model.nfseMunicipalServiceName
    this.nfseIssPercentage = model.nfseIssPercentage
    this.nfseCofinsPercentage = model.nfseCofinsPercentage
    this.nfsePisPercentage = model.nfsePisPercentage
    this.nfseCsllPercentage = model.nfseCsllPercentage
    this.nfseInssPercentage = model.nfseInssPercentage
    this.nfseIrPercentage = model.nfseIrPercentage
    this.nfseDeductions = model.nfseDeductions
    this.hasInsuranceByDefault = model.hasInsuranceByDefault
    this.insurancePercentage = model.insurancePercentage
    this.insuranceCoveragePercentage = model.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = model.insuranceClaimWaitingDays
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt?.toJSDate() ?? null
  }
}
