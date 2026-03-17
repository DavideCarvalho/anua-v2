import { BaseTransformer } from '@adonisjs/core/transformers'
import type InsuranceClaim from '#models/insurance_claim'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'
import UserTransformer from '#transformers/user_transformer'

export default class InsuranceClaimTransformer extends BaseTransformer<InsuranceClaim> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentPaymentId',
        'claimDate',
        'overdueAmount',
        'coveragePercentage',
        'coveredAmount',
        'status',
        'approvedAt',
        'approvedBy',
        'paidAt',
        'rejectedAt',
        'rejectedBy',
        'rejectionReason',
        'notes',
        'createdAt',
        'updatedAt',
      ]),
      studentPayment: StudentPaymentTransformer.transform(
        this.whenLoaded(this.resource.studentPayment)
      ),
      approvedByUser: UserTransformer.transform(this.whenLoaded(this.resource.approvedByUser)),
      rejectedByUser: UserTransformer.transform(this.whenLoaded(this.resource.rejectedByUser)),
    }
  }
}
