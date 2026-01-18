import vine from '@vinejs/vine'

export const createSchoolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    slug: vine.string().trim().minLength(2).maxLength(100).regex(/^[a-z0-9-]+$/),
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
    slug: vine.string().trim().minLength(2).maxLength(100).regex(/^[a-z0-9-]+$/).optional(),
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
  })
)
