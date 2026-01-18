import vine from '@vinejs/vine'

export const listUserSchoolsValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid().optional(),
    schoolId: vine.string().uuid().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createUserSchoolValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    schoolId: vine.string().uuid(),
    isDefault: vine.boolean().optional(),
  })
)

export const updateUserSchoolValidator = vine.compile(
  vine.object({
    isDefault: vine.boolean().optional(),
  })
)
