import vine from '@vinejs/vine'

export const chatValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(4000),
    threadId: vine.string().uuid().optional(),
    persona: vine.string().in(['gestor', 'comunicador']).optional(),
  })
)
