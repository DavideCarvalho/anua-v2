import { BaseTransformer } from '@adonisjs/core/transformers'
import type Contract from '#models/contract'
import SchoolTransformer from '#transformers/school_transformer'
import ContractDocumentTransformer from '#transformers/contract_document_transformer'
import ContractPaymentDayTransformer from '#transformers/contract_payment_day_transformer'
import ContractInterestConfigTransformer from '#transformers/contract_interest_config_transformer'
import ContractEarlyDiscountTransformer from '#transformers/contract_early_discount_transformer'
import StudentHasLevelTransformer from '#transformers/student_has_level_transformer'

export default class ContractTransformer extends BaseTransformer<Contract> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'schoolId',
        'academicPeriodId',
        'name',
        'description',
        'endDate',
        'enrollmentValue',
        'ammount',
        'docusealTemplateId',
        'paymentType',
        'enrollmentValueInstallments',
        'enrollmentPaymentUntilDays',
        'installments',
        'flexibleInstallments',
        'isActive',
        'hasInsurance',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school))?.depth(6),
      contractDocuments: ContractDocumentTransformer.transform(
        this.whenLoaded(this.resource.contractDocuments)
      ),
      paymentDays: ContractPaymentDayTransformer.transform(
        this.whenLoaded(this.resource.paymentDays)
      ),
      interestConfig: ContractInterestConfigTransformer.transform(
        this.whenLoaded(this.resource.interestConfig)
      ),
      earlyDiscounts: ContractEarlyDiscountTransformer.transform(
        this.whenLoaded(this.resource.earlyDiscounts)
      ),
      studentHasLevels: StudentHasLevelTransformer.transform(
        this.whenLoaded(this.resource.studentHasLevels)
      ),
      amount: this.resource.ammount,
    }
  }
}
