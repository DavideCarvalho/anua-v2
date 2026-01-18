import vine from '@vinejs/vine'

export const createClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    maxStudents: vine.number().min(1).optional(),
    status: vine.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    levelId: vine.string().trim(),
    schoolId: vine.string().trim(),
  })
)

export const updateClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    maxStudents: vine.number().min(1).optional().nullable(),
    status: vine.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  })
)
