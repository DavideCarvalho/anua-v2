import vine from '@vinejs/vine'

export const getStudentCalendarValidator = vine.compile(
  vine.object({
    view: vine.enum(['list', 'week', 'month']).optional(),
    from: vine.string().trim().optional(),
    to: vine.string().trim().optional(),
  })
)
