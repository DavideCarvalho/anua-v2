import vine from '@vinejs/vine'

export const createLevelAssignmentValidator = vine.compile(
  vine.object({
    levelId: vine.string().trim(),
    courseHasAcademicPeriodId: vine.string().trim(),
    isActive: vine.boolean().optional(),
  })
)
