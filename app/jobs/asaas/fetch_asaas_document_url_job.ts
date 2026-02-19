import { Job } from '@boringnode/queue'
import School from '#models/school'
import { fetchAsaasDocumentStatus } from '#services/asaas_service'

interface FetchAsaasDocumentUrlPayload {
  schoolId: string
}

export default class FetchAsaasDocumentUrlJob extends Job<FetchAsaasDocumentUrlPayload> {
  static readonly jobName = 'FetchAsaasDocumentUrlJob'

  static options = {
    queue: 'payments',
    maxRetries: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const school = await School.find(this.payload.schoolId)
    if (!school) {
      return
    }

    if (!school.asaasApiKey) {
      return
    }

    // Already resolved — nothing to do
    if (school.asaasDocumentUrl || school.paymentConfigStatus === 'ACTIVE') {
      return
    }

    const docStatus = await fetchAsaasDocumentStatus(school.asaasApiKey)

    if (docStatus.onboardingUrl) {
      school.asaasDocumentUrl = docStatus.onboardingUrl
      await school.save()
      return
    }

    if (docStatus.allApproved) {
      school.paymentConfigStatus = 'ACTIVE'
      await school.save()
      return
    }

    // Asaas hasn't generated the URL yet — throw to trigger retry
    throw new Error(`Document status not yet resolved for school ${school.id}. Will retry.`)
  }
}
