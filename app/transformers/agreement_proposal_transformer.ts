import { BaseTransformer } from '@adonisjs/core/transformers'
import type AgreementProposal from '#models/agreement_proposal'
import StudentTransformer from '#transformers/student_transformer'
import UserTransformer from '#transformers/user_transformer'
import AgreementProposalInvoiceTransformer from '#transformers/agreement_proposal_invoice_transformer'

export default class AgreementProposalTransformer extends BaseTransformer<AgreementProposal> {
  toObject() {
    const p = this.resource

    return {
      ...this.pick(p, [
        'id',
        'schoolId',
        'studentId',
        'status',
        'totalAmount',
        'installments',
        'overdueDays',
        'expiresAt',
        'approvedAt',
        'sentAt',
        'acceptedAt',
        'rejectionReason',
        'cancellationReason',
        'createdAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(p.student))?.depth(2),
      approvedBy: UserTransformer.transform(this.whenLoaded(p.approvedBy))?.depth(2),
      rejectedBy: UserTransformer.transform(this.whenLoaded(p.rejectedBy))?.depth(2),
      invoices: AgreementProposalInvoiceTransformer.transform(this.whenLoaded(p.invoices))?.depth(
        6
      ),
    }
  }
}
