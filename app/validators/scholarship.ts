import vine from '@vinejs/vine'

const scholarshipTypeEnum = vine.enum([
  'PHILANTHROPIC',
  'DISCOUNT',
  'COMPANY_PARTNERSHIP',
  'FREE',
] as const)

export const listScholarshipsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    search: vine.string().trim().optional(),
  })
)

export const createScholarshipValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    discountPercentage: vine.number().min(0).max(100),
    enrollmentDiscountPercentage: vine.number().min(0).max(100).optional(),
    type: scholarshipTypeEnum,
    description: vine.string().trim().optional(),
    schoolPartnerId: vine.string().trim().optional(),
    code: vine.string().trim().optional(),
  })
)

export const updateScholarshipValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    discountPercentage: vine.number().min(0).max(100).optional(),
    enrollmentDiscountPercentage: vine.number().min(0).max(100).optional(),
    type: scholarshipTypeEnum.optional(),
    description: vine.string().trim().optional(),
    schoolPartnerId: vine.string().trim().optional(),
    code: vine.string().trim().optional(),
  })
)
