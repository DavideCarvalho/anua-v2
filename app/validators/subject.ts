import vine from '@vinejs/vine'

export const listSubjectsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    search: vine.string().trim().optional(),
    schoolId: vine.string().uuid().optional(),
  })
)

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
