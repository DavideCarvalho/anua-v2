import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import School from '#models/school'
import AppException from '#exceptions/app_exception'
import { fetchAsaasDocumentStatus } from '#services/asaas_service'

export default class GetAsaasPaymentConfigController {
  async handle({ response, selectedSchoolIds }: HttpContext) {
    const school = await School.query()
      .whereIn('id', selectedSchoolIds ?? [])
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const hasAsaasAccount = Boolean(school.asaasAccountId)
    let documentUrl = school.asaasDocumentUrl

    // If account exists but pending, try fetching fresh document status
    if (school.asaasApiKey && school.paymentConfigStatus === 'PENDING_DOCUMENTS') {
      try {
        const docStatus = await fetchAsaasDocumentStatus(school.asaasApiKey)

        if (docStatus.onboardingUrl) {
          school.asaasDocumentUrl = docStatus.onboardingUrl
          documentUrl = docStatus.onboardingUrl
          await school.save()
        } else if (docStatus.allApproved) {
          school.paymentConfigStatus = 'ACTIVE'
          await school.save()
        }
      } catch (error) {
        logger.warn({ err: error }, 'Failed to fetch Asaas document status')
      }
    }

    return response.ok({
      paymentConfigStatus: school.paymentConfigStatus,
      hasAsaasAccount,
      documentUrl,
    })
  }
}
