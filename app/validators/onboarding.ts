import vine from '@vinejs/vine'

export const createSchoolOnboardingValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1),
    schoolChainId: vine.string().optional(),
    directorName: vine.string().minLength(1),
    directorEmail: vine.string().email(),
    directorPhone: vine.string().optional(),
    directorDocumentNumber: vine.string().regex(/^(\d{11}|\d{14})$/),
    isNetwork: vine.boolean().optional(),
    // Address fields
    street: vine.string().minLength(1),
    number: vine.string().minLength(1),
    complement: vine.string().optional(),
    neighborhood: vine.string().minLength(1),
    city: vine.string().minLength(1),
    state: vine.string().minLength(1),
    zipCode: vine.string().regex(/^\d{8}$/),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    // Subscription fields
    trialDays: vine.number().min(0).optional(),
    billingModel: vine.enum(['PER_ACTIVE_STUDENT', 'FIXED_MONTHLY'] as const).optional(),
    pricePerStudent: vine.number().min(0).optional(),
    monthlyFixedPrice: vine.number().min(0).optional(),
    platformFeeMode: vine.enum(['PERCENTAGE', 'FIXED'] as const).optional(),
    platformFeePercentage: vine.number().min(0).max(100).optional(),
    platformFeeFixedAmount: vine.number().min(0).optional(),
    // Insurance fields
    hasInsurance: vine.boolean().optional(),
    insurancePercentage: vine.number().min(0).max(100).optional(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional(),
    insuranceClaimWaitingDays: vine.number().min(0).optional(),
  })
)
