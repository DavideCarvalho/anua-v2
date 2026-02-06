import vine from '@vinejs/vine'

export const createExtraClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    description: vine.string().trim().optional(),
    academicPeriodId: vine.string().trim(),
    contractId: vine.string().trim(),
    teacherId: vine.string().trim(),
    maxStudents: vine.number().positive().optional(),
    schedules: vine
      .array(
        vine.object({
          weekDay: vine.number().min(0).max(6),
          startTime: vine.string().regex(/^\d{2}:\d{2}$/),
          endTime: vine.string().regex(/^\d{2}:\d{2}$/),
        })
      )
      .minLength(1),
  })
)

export const updateExtraClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    description: vine.string().trim().nullable().optional(),
    contractId: vine.string().trim().optional(),
    teacherId: vine.string().trim().optional(),
    maxStudents: vine.number().positive().nullable().optional(),
    isActive: vine.boolean().optional(),
    schedules: vine
      .array(
        vine.object({
          weekDay: vine.number().min(0).max(6),
          startTime: vine.string().regex(/^\d{2}:\d{2}$/),
          endTime: vine.string().regex(/^\d{2}:\d{2}$/),
        })
      )
      .minLength(1)
      .optional(),
  })
)

export const listExtraClassesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().optional(),
    schoolId: vine.string().trim().optional(),
    academicPeriodId: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    search: vine.string().trim().optional(),
  })
)

export const enrollExtraClassValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    contractId: vine.string().trim().optional(),
    scholarshipId: vine.string().trim().nullable().optional(),
    paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX'] as const),
    paymentDay: vine.number().min(1).max(31),
  })
)

export const createExtraClassAttendanceValidator = vine.compile(
  vine.object({
    date: vine.date({ formats: ['iso8601'] }),
    attendances: vine
      .array(
        vine.object({
          studentId: vine.string().trim(),
          status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED'] as const),
          justification: vine.string().trim().maxLength(500).optional(),
        })
      )
      .minLength(1),
  })
)

export const updateExtraClassAttendanceValidator = vine.compile(
  vine.object({
    status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED'] as const),
    justification: vine.string().trim().maxLength(500).nullable().optional(),
  })
)
