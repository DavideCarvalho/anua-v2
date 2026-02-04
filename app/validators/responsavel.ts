import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    phone: vine.string().trim().optional(),
  })
)
