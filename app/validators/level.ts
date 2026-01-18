import vine from '@vinejs/vine'

export const createLevelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    order: vine.number().min(0),
    courseId: vine.string().trim(),
    schoolId: vine.string().trim(),
  })
)

export const updateLevelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    order: vine.number().min(0).optional(),
  })
)
