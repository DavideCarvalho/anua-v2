import { Job } from '@boringnode/queue'
import EmitNfse from '#start/jobs/emit_nfse'

interface EmitNfsePayload {
  invoiceId: string
}

export default class EmitNfseJob extends Job<EmitNfsePayload> {
  static readonly jobName = 'EmitNfseJob'

  static options = {
    queue: 'payments',
    maxRetries: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await EmitNfse.handle(this.payload)
  }
}
