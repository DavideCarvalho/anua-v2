import { BaseTransformer } from '@adonisjs/core/transformers'
import type SchoolChain from '#models/school_chain'

export default class SchoolChainTransformer extends BaseTransformer<SchoolChain> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'slug',
      'subscriptionLevel',
      'asaasAccountId',
      'asaasWebhookToken',
      'asaasWalletId',
      'allowSchoolsToOverridePaymentConfig',
      'allowSchoolsToOverrideNotifications',
      'usePlatformManagedPayments',
      'enablePaymentNotifications',
      'nfseEnabled',
      'nfseMunicipalServiceCode',
      'nfseMunicipalServiceName',
      'nfseIssPercentage',
      'nfseCofinsPercentage',
      'nfsePisPercentage',
      'nfseCsllPercentage',
      'nfseInssPercentage',
      'nfseIrPercentage',
      'nfseDeductions',
      'hasInsuranceByDefault',
      'insurancePercentage',
      'insuranceCoveragePercentage',
      'insuranceClaimWaitingDays',
      'createdAt',
      'updatedAt',
    ])
  }
}
