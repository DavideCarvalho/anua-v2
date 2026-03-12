import vine from '@vinejs/vine'

export const listPedagogicalCalendarValidator = vine.compile(
  vine.object({
    classId: vine.string().trim().optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
  })
)

export const getPedagogicalCreationContextValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().trim().optional(),
  })
)
