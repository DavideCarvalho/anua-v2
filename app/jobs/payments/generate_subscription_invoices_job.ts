import { Job } from '@adonisjs/queue'
import GenerateSubscriptionInvoices from '#start/jobs/generate_subscription_invoices'

interface GenerateSubscriptionInvoicesPayload {
  month?: number
  year?: number
}

export default class GenerateSubscriptionInvoicesJob extends Job<GenerateSubscriptionInvoicesPayload> {
  static readonly jobName = 'GenerateSubscriptionInvoicesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await GenerateSubscriptionInvoices.handle(this.payload)
  }
}
