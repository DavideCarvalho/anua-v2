import vine from '@vinejs/vine'

export const createCourseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    schoolId: vine.string().trim(),
  })
)

export const updateCourseValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)
