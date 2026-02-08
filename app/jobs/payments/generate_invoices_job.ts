import { Job } from '@boringnode/queue'
import GenerateInvoices from '#start/jobs/generate_invoices'

interface GenerateInvoicesPayload {
  schoolIds?: string[]
  month?: number
  year?: number
}

export default class GenerateInvoicesJob extends Job<GenerateInvoicesPayload> {
  static readonly jobName = 'GenerateInvoicesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await GenerateInvoices.handle(this.payload)
  }
}
