import vine from '@vinejs/vine'

export const toggleSchoolSelectionValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
  })
)

export const toggleSchoolGroupSelectionValidator = vine.compile(
  vine.object({
    schoolGroupId: vine.string(),
  })
)
