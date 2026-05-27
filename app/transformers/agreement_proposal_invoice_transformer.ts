import { BaseTransformer } from '@adonisjs/core/transformers'
import type AgreementProposalInvoice from '#models/agreement_proposal_invoice'
import InvoiceTransformer from '#transformers/invoice_transformer'

export default class AgreementProposalInvoiceTransformer extends BaseTransformer<AgreementProposalInvoice> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'invoiceId', 'amount', 'overdueDays']),
      invoice: InvoiceTransformer.transform(this.whenLoaded(this.resource.invoice)),
    }
  }
}
