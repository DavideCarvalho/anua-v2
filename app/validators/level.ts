import vine from '@vinejs/vine'

export const createLevelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    order: vine.number().min(0),
    schoolId: vine.string().trim(),
    contractId: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateLevelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    order: vine.number().min(0).optional(),
    contractId: vine.string().trim().optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)
