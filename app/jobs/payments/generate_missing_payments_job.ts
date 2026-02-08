import { Job } from '@boringnode/queue'
import GenerateMissingPayments from '#start/jobs/generate_missing_payments'

interface GenerateMissingPaymentsPayload {
  schoolId?: string
}

export default class GenerateMissingPaymentsJob extends Job<GenerateMissingPaymentsPayload> {
  static readonly jobName = 'GenerateMissingPaymentsJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await GenerateMissingPayments.handle({
      schoolId: this.payload.schoolId,
      inline: true,
    })
  }
}
