import vine from '@vinejs/vine'

export const createTeacherValidator = vine.compile(
  vine.object({
    userId: vine.string().trim(),
    hourlyRate: vine.number().min(0).optional(),
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
    subjectId: vine.string().trim().optional(),
    isMainTeacher: vine.boolean().optional(),
  })
)
