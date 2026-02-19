import { Job } from '@boringnode/queue'
import ApplyInvoiceInterest from '#start/jobs/apply_invoice_interest'

interface ApplyInvoiceInterestPayload {
  schoolId?: string
}

export default class ApplyInvoiceInterestJob extends Job<ApplyInvoiceInterestPayload> {
  static readonly jobName = 'ApplyInvoiceInterestJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await ApplyInvoiceInterest.handle(this.payload)
  }
}
