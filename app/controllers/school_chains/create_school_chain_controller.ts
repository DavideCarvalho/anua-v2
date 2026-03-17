import type { HttpContext } from '@adonisjs/core/http'
import { v7 as uuidv7 } from 'uuid'
import db from '@adonisjs/lucid/services/db'
import SchoolChain from '#models/school_chain'
import User from '#models/user'
import Role from '#models/role'
import { createSchoolChainValidator } from '#validators/school_chain'
import AppException from '#exceptions/app_exception'
import SchoolChainTransformer from '#transformers/school_chain_transformer'

export default class CreateSchoolChainController {
  async handle({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createSchoolChainValidator)

    const role = await Role.findBy('name', 'SCHOOL_CHAIN_DIRECTOR')
    if (!role) {
      throw AppException.operationFailedWithProvidedData(422)
    }

    const existing = await SchoolChain.findBy('slug', payload.slug)
    if (existing) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const existingUser = await User.findBy('email', payload.directorEmail)

    const schoolChain = await db.transaction(async (trx) => {
      const chain = await SchoolChain.create(
        {
          name: payload.name,
          slug: payload.slug,
          subscriptionLevel: payload.subscriptionLevel ?? 'NETWORK',
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
        },
        { client: trx }
      )

      if (existingUser) {
        existingUser.useTransaction(trx)
        existingUser.schoolChainId = chain.id
        existingUser.schoolId = null
        existingUser.roleId = role.id
        existingUser.documentType =
          existingUser.documentType ??
          (payload.directorDocumentNumber.length === 14 ? 'CNPJ' : 'CPF')
        existingUser.documentNumber = existingUser.documentNumber ?? payload.directorDocumentNumber
        if (!existingUser.phone && payload.directorPhone) {
          existingUser.phone = payload.directorPhone
        }
        await existingUser.save()
      } else {
        const emailPrefix = payload.directorEmail.split('@')[0] || payload.directorEmail
        let userSlug = emailPrefix
        const slugAlreadyExists = await User.query({ client: trx }).where('slug', userSlug).first()
        if (slugAlreadyExists) {
          userSlug = `${emailPrefix}-${Math.random().toString(36).slice(2, 8)}`
        }

        await User.create(
          {
            id: uuidv7(),
            name: payload.directorName,
            slug: userSlug,
            email: payload.directorEmail,
            phone: payload.directorPhone ?? null,
            documentType: payload.directorDocumentNumber.length === 14 ? 'CNPJ' : 'CPF',
            documentNumber: payload.directorDocumentNumber,
            roleId: role.id,
            schoolId: null,
            schoolChainId: chain.id,
            active: true,
            whatsappContact: false,
            grossSalary: 0,
          },
          { client: trx }
        )
      }

      return chain
    })

    return response.created(await serialize(SchoolChainTransformer.transform(schoolChain)))
  }
}
