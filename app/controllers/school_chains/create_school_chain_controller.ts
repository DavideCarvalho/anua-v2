import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import { createSchoolChainValidator } from '#validators/school_chain'

export default class CreateSchoolChainController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createSchoolChainValidator)

    const existing = await SchoolChain.findBy('slug', payload.slug)
    if (existing) {
      return response.conflict({ message: 'Já existe uma rede com este slug' })
    }

    const schoolChain = await SchoolChain.create({
      name: payload.name,
      slug: payload.slug,
      subscriptionLevel: payload.subscriptionLevel ?? 'INDIVIDUAL',
      asaasAccountId: payload.asaasAccountId ?? null,
      asaasWebhookToken: payload.asaasWebhookToken ?? null,
      asaasWalletId: payload.asaasWalletId ?? null,
      asaasApiKey: payload.asaasApiKey ?? null,
      allowSchoolsToOverridePaymentConfig: payload.allowSchoolsToOverridePaymentConfig ?? false,
      allowSchoolsToOverrideNotifications: payload.allowSchoolsToOverrideNotifications ?? true,
      usePlatformManagedPayments: payload.usePlatformManagedPayments ?? false,
      enablePaymentNotifications: payload.enablePaymentNotifications ?? true,
      hasInsuranceByDefault: payload.hasInsuranceByDefault ?? false,
      insurancePercentage: payload.insurancePercentage ?? null,
      insuranceCoveragePercentage: payload.insuranceCoveragePercentage ?? null,
      insuranceClaimWaitingDays: payload.insuranceClaimWaitingDays ?? null,
    })

    return response.created(schoolChain)
  }
}
