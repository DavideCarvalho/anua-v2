import vine from '@vinejs/vine'

export const createSchoolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-z0-9-]+$/),
    street: vine.string().trim().maxLength(255).optional(),
    number: vine.string().trim().maxLength(20).optional(),
    complement: vine.string().trim().maxLength(100).optional(),
    neighborhood: vine.string().trim().maxLength(100).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    state: vine.string().trim().maxLength(2).optional(),
    zipCode: vine.string().trim().maxLength(10).optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
    logoUrl: vine.string().trim().url().optional(),
    schoolChainId: vine.string().uuid().optional(),
    minimumGrade: vine.number().min(0).max(10).optional(),
    calculationAlgorithm: vine.enum(['AVERAGE', 'SUM']).optional(),
    minimumAttendancePercentage: vine.number().min(0).max(100).optional(),
  })
)

export const updateSchoolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    street: vine.string().trim().maxLength(255).optional().nullable(),
    number: vine.string().trim().maxLength(20).optional().nullable(),
    complement: vine.string().trim().maxLength(100).optional().nullable(),
    neighborhood: vine.string().trim().maxLength(100).optional().nullable(),
    city: vine.string().trim().maxLength(100).optional().nullable(),
    state: vine.string().trim().maxLength(2).optional().nullable(),
    zipCode: vine.string().trim().maxLength(10).optional().nullable(),
    latitude: vine.number().optional().nullable(),
    longitude: vine.number().optional().nullable(),
    logoUrl: vine.string().trim().url().optional().nullable(),
    schoolChainId: vine.string().uuid().optional().nullable(),
    minimumGrade: vine.number().min(0).max(10).optional(),
    calculationAlgorithm: vine.enum(['AVERAGE', 'SUM']).optional(),
    minimumAttendancePercentage: vine.number().min(0).max(100).optional(),
    active: vine.boolean().optional(),
    // Insurance fields
    hasInsurance: vine.boolean().optional().nullable(),
    insurancePercentage: vine.number().min(3).max(100).optional().nullable(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceClaimWaitingDays: vine.number().min(1).optional().nullable(),
    // NFS-e fields
    nfseEnabled: vine.boolean().optional(),
    nfseMunicipalServiceCode: vine.string().trim().maxLength(64).optional().nullable(),
    nfseMunicipalServiceName: vine.string().trim().maxLength(255).optional().nullable(),
    nfseIssPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfseCofinsPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfsePisPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfseCsllPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfseInssPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfseIrPercentage: vine.number().min(0).max(100).optional().nullable(),
    nfseDeductions: vine.number().min(0).optional().nullable(),
  })
)

export const updateDirectorValidator = vine.compile(
  vine.object({
    existingUserId: vine.string().optional(),
    newDirector: vine
      .object({
        name: vine.string().minLength(2),
        email: vine.string().email(),
        phone: vine.string().optional(),
      })
      .optional(),
  })
)
