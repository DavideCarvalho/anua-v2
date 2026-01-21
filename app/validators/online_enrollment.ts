import vine from '@vinejs/vine'

export const checkExistingValidator = vine.compile(
  vine.object({
    document: vine.string().optional(),
    email: vine.string().email().optional(),
    levelId: vine.string(),
  })
)

export const findScholarshipValidator = vine.compile(
  vine.object({
    code: vine.string(),
    schoolId: vine.string(),
  })
)
