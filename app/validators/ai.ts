import vine from '@vinejs/vine'

export const chatValidator = vine.compile(
  vine.object({
    threadId: vine.string().uuid(),
    persona: vine.string().in(['gestor', 'comunicador']).optional(),
  })
)
