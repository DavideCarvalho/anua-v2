import { Job } from '@boringnode/queue'
import RetrySubscriptionInvoiceCharges from '#start/jobs/retry_subscription_invoice_charges'

export default class RetrySubscriptionInvoiceChargesJob extends Job<Record<string, never>> {
  static readonly jobName = 'RetrySubscriptionInvoiceChargesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await RetrySubscriptionInvoiceCharges.handle()
  }
}
