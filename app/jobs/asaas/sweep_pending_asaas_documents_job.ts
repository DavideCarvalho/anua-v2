import { Job } from '@boringnode/queue'
import School from '#models/school'
import FetchAsaasDocumentUrlJob from './fetch_asaas_document_url_job.js'

interface SweepPendingAsaasDocumentsPayload {}

export default class SweepPendingAsaasDocumentsJob extends Job<SweepPendingAsaasDocumentsPayload> {
  static readonly jobName = 'SweepPendingAsaasDocumentsJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const schools = await School.query()
      .whereNotNull('asaasApiKey')
      .whereNull('asaasDocumentUrl')
      .whereIn('paymentConfigStatus', ['PENDING_DOCUMENTS', 'PENDING_APPROVAL'])

    for (const school of schools) {
      await FetchAsaasDocumentUrlJob.dispatch({ schoolId: school.id })
    }
  }
}
