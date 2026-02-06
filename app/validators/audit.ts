import vine from '@vinejs/vine'

export const listAuditsValidator = vine.compile(
  vine.object({
    params: vine.object({
      entityType: vine.enum([
        'invoice',
        'student-payment',
        'student-has-level',
        'agreement',
        'contract',
      ]),
      entityId: vine.string().uuid(),
    }),
  })
)
