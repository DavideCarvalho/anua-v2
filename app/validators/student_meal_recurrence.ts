import vine from '@vinejs/vine'

export const updateStudentMealRecurrenceValidator = vine.compile(
  vine.object({
    slots: vine.array(
      vine.object({
        weekDay: vine.number().min(1).max(5),
        mealType: vine.enum(['LUNCH', 'DINNER']),
        canteenMealId: vine.string().trim().optional().nullable(),
      })
    ),
  })
)

export const checkMealRecurrenceValidator = vine.compile(
  vine.object({
    date: vine.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    mealType: vine.enum(['LUNCH', 'DINNER']),
  })
)
