import vine from '@vinejs/vine'

export const createTeacherValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email().trim(),
    schoolId: vine.string().uuid(),
    hourlyRate: vine.number().min(0).optional(),
    subjectIds: vine.array(vine.string().uuid()).optional(),
  })
)

export const updateTeacherValidator = vine.compile(
  vine.object({
    hourlyRate: vine.number().min(0).optional(),
  })
)

export const assignTeacherToClassValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
    subjectId: vine.string().trim(),
    subjectQuantity: vine.number().min(1).optional(),
  })
)

export const updateTeacherSubjectsValidator = vine.compile(
  vine.object({
    subjectIds: vine.array(vine.string().trim()),
  })
)
