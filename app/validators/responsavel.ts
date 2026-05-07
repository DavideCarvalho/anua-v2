import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    phone: vine.string().trim().optional(),
  })
)

export const getStudentBalanceValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const getStudentGradesValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid().optional(),
  })
)

export const getStudentAssignmentsValidator = vine.compile(
  vine.object({
    subPeriodId: vine.string().uuid().optional(),
    status: vine.string().optional(),
    subjectId: vine.string().uuid().optional(),
  })
)

export const getStudentAttendanceValidator = vine.compile(
  vine.object({
    subPeriodId: vine.string().uuid().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
