import { BaseTransformer } from '@adonisjs/core/transformers'
import type School from '#models/school'
import SchoolChainTransformer from '#transformers/school_chain_transformer'
import UserHasSchoolTransformer from '#transformers/user_has_school_transformer'
import UserTransformer from '#transformers/user_transformer'
import SchoolGroupTransformer from '#transformers/school_group_transformer'
import InsuranceBillingTransformer from '#transformers/insurance_billing_transformer'

export default class SchoolTransformer extends BaseTransformer<School> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'zipCode',
        'latitude',
        'longitude',
        'location',
        'logoUrl',
        'asaasAccountId',
        'asaasWebhookToken',
        'asaasWalletId',
        'asaasDocumentUrl',
        'asaasCommercialInfoIsExpired',
        'asaasCommercialInfoScheduledDate',
        'paymentConfigStatus',
        'paymentConfigStatusUpdatedAt',
        'pixKey',
        'pixKeyType',
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
        'minimumGrade',
        'calculationAlgorithm',
        'minimumAttendancePercentage',
        'hasInsurance',
        'insurancePercentage',
        'insuranceCoveragePercentage',
        'insuranceClaimWaitingDays',
        'schoolChainId',
        'createdAt',
        'updatedAt',
      ]),
      schoolChain: SchoolChainTransformer.transform(
        this.whenLoaded(this.resource.schoolChain)
      )?.depth(6),
      userHasSchools: UserHasSchoolTransformer.transform(
        this.whenLoaded(this.resource.userHasSchools)
      ),
      users: UserTransformer.transform(this.whenLoaded(this.resource.users)),
      schoolGroups: SchoolGroupTransformer.transform(this.whenLoaded(this.resource.schoolGroups)),
      insuranceBillings: InsuranceBillingTransformer.transform(
        this.whenLoaded(this.resource.insuranceBillings)
      ),
    }
  }
}
