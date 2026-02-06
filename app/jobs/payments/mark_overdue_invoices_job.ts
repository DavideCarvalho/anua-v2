import { Job } from '@boringnode/queue'
import MarkOverdueInvoices from '#start/jobs/mark_overdue_invoices'

interface MarkOverdueInvoicesPayload {}

export default class MarkOverdueInvoicesJob extends Job<MarkOverdueInvoicesPayload> {
  static readonly jobName = 'MarkOverdueInvoicesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
  }

  async execute(): Promise<void> {
    await MarkOverdueInvoices.handle()
  }
}
