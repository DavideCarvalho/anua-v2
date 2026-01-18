import vine from '@vinejs/vine'

export const listUserSchoolGroupsValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid().optional(),
    schoolGroupId: vine.string().uuid().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createUserSchoolGroupValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    schoolGroupId: vine.string().uuid(),
  })
)
