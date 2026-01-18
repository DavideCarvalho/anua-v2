import vine from '@vinejs/vine'

const segmentEnum = vine.enum([
  'KINDERGARTEN',
  'ELEMENTARY',
  'HIGHSCHOOL',
  'TECHNICAL',
  'UNIVERSITY',
  'OTHER',
] as const)

export const listAcademicPeriodsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const createAcademicPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    slug: vine.string().trim().optional(),
    startDate: vine.date(),
    endDate: vine.date(),
    enrollmentStartDate: vine.date().optional(),
    enrollmentEndDate: vine.date().optional(),
    segment: segmentEnum,
    previousAcademicPeriodId: vine.string().trim().optional(),
    minimumGradeOverride: vine.number().optional(),
    minimumAttendanceOverride: vine.number().optional(),
  })
)

export const updateAcademicPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    slug: vine.string().trim().optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    enrollmentStartDate: vine.date().optional(),
    enrollmentEndDate: vine.date().optional(),
    segment: segmentEnum.optional(),
    previousAcademicPeriodId: vine.string().trim().optional(),
    minimumGradeOverride: vine.number().optional(),
    minimumAttendanceOverride: vine.number().optional(),
    isActive: vine.boolean().optional(),
    isClosed: vine.boolean().optional(),
  })
)
