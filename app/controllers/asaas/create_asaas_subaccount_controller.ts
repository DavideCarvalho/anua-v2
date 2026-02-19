import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'
import School from '#models/school'
import AppException from '#exceptions/app_exception'
import { AsaasApiError, createAsaasSubaccount } from '#services/asaas_service'
import { buildAsaasSubaccountWebhooks } from '#services/asaas_webhook_config'
import { createAsaasSubaccountValidator } from '#validators/asaas_subaccount'
import FetchAsaasDocumentUrlJob from '#jobs/asaas/fetch_asaas_document_url_job'
import { getQueueManager } from '#services/queue_service'

export default class CreateAsaasSubaccountController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const payload = await request.validateUsing(createAsaasSubaccountValidator)

    const school = await School.query()
      .whereIn('id', selectedSchoolIds ?? [])
      .preload('schoolChain')
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    // Guard: prevent duplicate subconta creation
    if (school.asaasAccountId) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    // Guard: chain doesn't allow school-level override
    const chain = school.schoolChain
    if (chain?.asaasApiKey && !chain.allowSchoolsToOverridePaymentConfig) {
      throw AppException.forbidden(
        'A rede não permite que escolas configurem pagamentos individualmente'
      )
    }

    const webhookToken = randomBytes(32).toString('hex')
    const webhookUrl = process.env.ASAAS_WEBHOOK_URL!
    const platformWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN!

    const webhooks = buildAsaasSubaccountWebhooks(
      webhookUrl,
      webhookToken,
      platformWebhookToken,
      payload.email
    )

    const stripNonDigits = (value: string) => value.replace(/\D/g, '')

    let result
    try {
      result = await createAsaasSubaccount({
        name: payload.name,
        email: payload.email,
        cpfCnpj: stripNonDigits(payload.cpfCnpj),
        companyType: payload.companyType,
        birthDate: payload.birthDate,
        phone: payload.phone ? stripNonDigits(payload.phone) : undefined,
        mobilePhone: payload.mobilePhone ? stripNonDigits(payload.mobilePhone) : undefined,
        address: payload.address,
        addressNumber: payload.addressNumber,
        complement: payload.complement,
        province: payload.province,
        postalCode: stripNonDigits(payload.postalCode),
        incomeValue: payload.incomeValue,
        webhooks,
      })
    } catch (error) {
      if (error instanceof AsaasApiError) {
        throw AppException.badRequest(error.message)
      }
      throw error
    }

    school.asaasAccountId = result.id
    school.asaasWalletId = result.walletId
    school.asaasApiKey = result.apiKey
    school.asaasWebhookToken = webhookToken
    school.paymentConfigStatus = 'PENDING_DOCUMENTS'
    await school.save()

    // Dispatch job to fetch document URL (with ~15s delay for Asaas processing)
    await getQueueManager()
    await FetchAsaasDocumentUrlJob.dispatch({ schoolId: school.id })

    return response.created({
      success: true,
      paymentConfigStatus: school.paymentConfigStatus,
    })
  }
}
