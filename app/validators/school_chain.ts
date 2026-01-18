import vine from '@vinejs/vine'

const subscriptionLevelEnum = vine.enum(['NETWORK', 'INDIVIDUAL'] as const)

export const listSchoolChainsValidator = vine.compile(
  vine.object({
    search: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createSchoolChainValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    slug: vine
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/),
    subscriptionLevel: subscriptionLevelEnum.optional(),
    asaasAccountId: vine.string().trim().optional().nullable(),
    asaasWebhookToken: vine.string().trim().optional().nullable(),
    asaasWalletId: vine.string().trim().optional().nullable(),
    asaasApiKey: vine.string().trim().optional().nullable(),
    allowSchoolsToOverridePaymentConfig: vine.boolean().optional(),
    allowSchoolsToOverrideNotifications: vine.boolean().optional(),
    usePlatformManagedPayments: vine.boolean().optional(),
    enablePaymentNotifications: vine.boolean().optional(),
    hasInsuranceByDefault: vine.boolean().optional(),
    insurancePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceClaimWaitingDays: vine.number().min(0).optional().nullable(),
  })
)

export const updateSchoolChainValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    slug: vine
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    subscriptionLevel: subscriptionLevelEnum.optional(),
    asaasAccountId: vine.string().trim().optional().nullable(),
    asaasWebhookToken: vine.string().trim().optional().nullable(),
    asaasWalletId: vine.string().trim().optional().nullable(),
    asaasApiKey: vine.string().trim().optional().nullable(),
    allowSchoolsToOverridePaymentConfig: vine.boolean().optional(),
    allowSchoolsToOverrideNotifications: vine.boolean().optional(),
    usePlatformManagedPayments: vine.boolean().optional(),
    enablePaymentNotifications: vine.boolean().optional(),
    hasInsuranceByDefault: vine.boolean().optional(),
    insurancePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceClaimWaitingDays: vine.number().min(0).optional().nullable(),
  })
)
