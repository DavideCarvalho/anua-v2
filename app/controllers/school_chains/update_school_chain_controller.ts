import type { HttpContext } from '@adonisjs/core/http'
import SchoolChain from '#models/school_chain'
import { updateSchoolChainValidator } from '#validators/school_chain'

export default class UpdateSchoolChainController {
  async handle({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateSchoolChainValidator)

    const schoolChain = await SchoolChain.find(params.id)
    if (!schoolChain) {
      return response.notFound({ message: 'Rede de escolas não encontrada' })
    }

    if (payload.slug && payload.slug !== schoolChain.slug) {
      const existing = await SchoolChain.query()
        .where('slug', payload.slug)
        .whereNot('id', schoolChain.id)
        .first()

      if (existing) {
        return response.conflict({ message: 'Já existe uma rede com este slug' })
      }
    }

    schoolChain.merge({
      name: payload.name ?? schoolChain.name,
      slug: payload.slug ?? schoolChain.slug,
      subscriptionLevel: payload.subscriptionLevel ?? schoolChain.subscriptionLevel,
      asaasAccountId:
        payload.asaasAccountId !== undefined ? payload.asaasAccountId : schoolChain.asaasAccountId,
      asaasWebhookToken:
        payload.asaasWebhookToken !== undefined
          ? payload.asaasWebhookToken
          : schoolChain.asaasWebhookToken,
      asaasWalletId:
        payload.asaasWalletId !== undefined ? payload.asaasWalletId : schoolChain.asaasWalletId,
      asaasApiKey:
        payload.asaasApiKey !== undefined ? payload.asaasApiKey : schoolChain.asaasApiKey,
      allowSchoolsToOverridePaymentConfig:
        payload.allowSchoolsToOverridePaymentConfig !== undefined
          ? payload.allowSchoolsToOverridePaymentConfig
          : schoolChain.allowSchoolsToOverridePaymentConfig,
      allowSchoolsToOverrideNotifications:
        payload.allowSchoolsToOverrideNotifications !== undefined
          ? payload.allowSchoolsToOverrideNotifications
          : schoolChain.allowSchoolsToOverrideNotifications,
      usePlatformManagedPayments:
        payload.usePlatformManagedPayments !== undefined
          ? payload.usePlatformManagedPayments
          : schoolChain.usePlatformManagedPayments,
      enablePaymentNotifications:
        payload.enablePaymentNotifications !== undefined
          ? payload.enablePaymentNotifications
          : schoolChain.enablePaymentNotifications,
      hasInsuranceByDefault:
        payload.hasInsuranceByDefault !== undefined
          ? payload.hasInsuranceByDefault
          : schoolChain.hasInsuranceByDefault,
      insurancePercentage:
        payload.insurancePercentage !== undefined
          ? payload.insurancePercentage
          : schoolChain.insurancePercentage,
      insuranceCoveragePercentage:
        payload.insuranceCoveragePercentage !== undefined
          ? payload.insuranceCoveragePercentage
          : schoolChain.insuranceCoveragePercentage,
      insuranceClaimWaitingDays:
        payload.insuranceClaimWaitingDays !== undefined
          ? payload.insuranceClaimWaitingDays
          : schoolChain.insuranceClaimWaitingDays,
    })

    await schoolChain.save()

    return response.ok(schoolChain)
  }
}
