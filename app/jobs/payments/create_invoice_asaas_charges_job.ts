import { Job } from '@boringnode/queue'
import CreateInvoiceAsaasCharges from '#start/jobs/create_invoice_asaas_charges'

interface CreateInvoiceAsaasChargesPayload {
  schoolId?: string
  month?: number
  year?: number
}

export default class CreateInvoiceAsaasChargesJob extends Job<CreateInvoiceAsaasChargesPayload> {
  static readonly jobName = 'CreateInvoiceAsaasChargesJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await CreateInvoiceAsaasCharges.handle(this.payload)
  }
}
