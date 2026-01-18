import vine from '@vinejs/vine'

export const listSchoolPartnersValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createSchoolPartnerValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    cnpj: vine.string().trim(),
    email: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
    contactName: vine.string().trim().optional(),
    discountPercentage: vine.number().min(0).max(100),
    partnershipStartDate: vine.date(),
    partnershipEndDate: vine.date().optional(),
  })
)

export const updateSchoolPartnerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    cnpj: vine.string().trim().optional(),
    email: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
    contactName: vine.string().trim().optional(),
    discountPercentage: vine.number().min(0).max(100).optional(),
    partnershipStartDate: vine.date().optional(),
    partnershipEndDate: vine.date().optional(),
    isActive: vine.boolean().optional(),
  })
)
