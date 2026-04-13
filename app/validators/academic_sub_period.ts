import vine from '@vinejs/vine'

export const listAcademicSubPeriodsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid().optional(),
    schoolId: vine.string().uuid().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createAcademicSubPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    order: vine.number().min(1).max(12),
    startDate: vine.date({ formats: ['iso8601'] }),
    endDate: vine.date({ formats: ['iso8601'] }).afterOrEqualTo('startDate'),
    weight: vine.number().min(0).max(10).optional(),
    minimumGrade: vine.number().min(0).max(10).optional().nullable(),
    hasRecovery: vine.boolean().optional(),
    recoveryStartDate: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .nullable(),
    recoveryEndDate: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .nullable(),
    academicPeriodId: vine.string().uuid(),
    schoolId: vine.string().uuid(),
  })
)

export const updateAcademicSubPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    order: vine.number().min(1).max(12).optional(),
    startDate: vine.date({ formats: ['iso8601'] }).optional(),
    endDate: vine.date({ formats: ['iso8601'] }).optional(),
    weight: vine.number().min(0).max(10).optional(),
    minimumGrade: vine.number().min(0).max(10).optional().nullable(),
    hasRecovery: vine.boolean().optional(),
    recoveryStartDate: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .nullable(),
    recoveryEndDate: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .nullable(),
  })
)

export const generateSubPeriodsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid(),
    schoolId: vine.string().uuid(),
  })
)
