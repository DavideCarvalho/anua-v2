import { Job } from '@boringnode/queue'
import app from '@adonisjs/core/services/app'
import School from '#models/school'
import AppException from '#exceptions/app_exception'
import AsaasService from '#services/asaas_service'

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
    const asaasService = await app.container.make(AsaasService)
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

    const docStatus = await asaasService.fetchAsaasDocumentStatus(school.asaasApiKey)

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
    throw AppException.internalServerError(
      `Document status not yet resolved for school ${school.id}. Will retry.`
    )
  }
}
