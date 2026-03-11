import vine from '@vinejs/vine'

export const listPedagogicalCalendarValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
  })
)
