import vine from '@vinejs/vine'

export const createAttendanceValidator = vine.compile(
  vine.object({
    status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']),
    justification: vine.string().trim().maxLength(500).optional(),
    studentId: vine.string().trim(),
    classScheduleId: vine.string().trim(),
  })
)

export const updateAttendanceValidator = vine.compile(
  vine.object({
    status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']).optional(),
    justification: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

export const batchCreateAttendanceValidator = vine.compile(
  vine.object({
    classScheduleId: vine.string().trim(),
    attendances: vine.array(
      vine.object({
        studentId: vine.string().trim(),
        status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']),
        justification: vine.string().trim().maxLength(500).optional(),
      })
    ),
  })
)
