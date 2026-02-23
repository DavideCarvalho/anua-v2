import { Job } from '@boringnode/queue'
import MarkOverdueInvoices from '#start/jobs/mark_overdue_invoices'
import ApplyInvoiceInterest from '#start/jobs/apply_invoice_interest'

interface RefreshOverdueInvoicesPayload {
  schoolId?: string
}

export default class RefreshOverdueInvoicesJob extends Job<RefreshOverdueInvoicesPayload> {
  static readonly jobName = 'RefreshOverdueInvoicesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await MarkOverdueInvoices.handle()
    await ApplyInvoiceInterest.handle({ schoolId: this.payload.schoolId })
  }
}
