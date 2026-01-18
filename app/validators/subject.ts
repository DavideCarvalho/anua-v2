import vine from '@vinejs/vine'

export const createSubjectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    quantityNeededScheduled: vine.number().min(0).optional(),
    schoolId: vine.string().trim(),
  })
)

export const updateSubjectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    quantityNeededScheduled: vine.number().min(0).optional(),
  })
)
