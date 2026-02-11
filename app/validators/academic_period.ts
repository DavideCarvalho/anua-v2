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
    schoolId: vine.string().trim().optional(),
    name: vine.string().trim(),
    slug: vine.string().trim().optional(),
    startDate: vine.date({ formats: ['iso8601'] }),
    endDate: vine.date({ formats: ['iso8601'] }),
    enrollmentStartDate: vine.date({ formats: ['iso8601'] }).optional(),
    enrollmentEndDate: vine.date({ formats: ['iso8601'] }).optional(),
    segment: segmentEnum,
    previousAcademicPeriodId: vine.string().trim().optional(),
    minimumGradeOverride: vine.number().optional(),
    minimumAttendanceOverride: vine.number().optional(),
    courses: vine
      .array(
        vine.object({
          courseId: vine.string().optional(),
          name: vine.string().trim(),
          levels: vine.array(
            vine.object({
              levelId: vine.string().optional(),
              name: vine.string().trim(),
              order: vine.number(),
              contractId: vine.string().optional(),
              classes: vine
                .array(
                  vine.object({
                    name: vine.string().trim(),
                    teachers: vine
                      .array(
                        vine.object({
                          teacherId: vine.string(),
                          subjectId: vine.string(),
                          subjectQuantity: vine.number(),
                        })
                      )
                      .optional(),
                  })
                )
                .optional(),
            })
          ),
        })
      )
      .optional(),
  })
)

export const updateAcademicPeriodValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    slug: vine.string().trim().optional(),
    startDate: vine.date({ formats: ['iso8601'] }).optional(),
    endDate: vine.date({ formats: ['iso8601'] }).optional(),
    enrollmentStartDate: vine.date({ formats: ['iso8601'] }).optional(),
    enrollmentEndDate: vine.date({ formats: ['iso8601'] }).optional(),
    segment: segmentEnum.optional(),
    previousAcademicPeriodId: vine.string().trim().optional(),
    minimumGradeOverride: vine.number().optional(),
    minimumAttendanceOverride: vine.number().optional(),
    isActive: vine.boolean().optional(),
    isClosed: vine.boolean().optional(),
  })
)

export const updateCoursesValidator = vine.compile(
  vine.object({
    courses: vine.array(
      vine.object({
        id: vine.string().optional(),
        courseId: vine.string(),
        levels: vine.array(
          vine.object({
            id: vine.string().optional(),
            levelId: vine.string().optional(),
            name: vine.string().trim(),
            order: vine.number(),
            contractId: vine.string().optional(),
            isActive: vine.boolean().optional(),
            classes: vine
              .array(
                vine.object({
                  id: vine.string().optional(),
                  name: vine.string(),
                  teachers: vine
                    .array(
                      vine.object({
                        id: vine.string().optional(),
                        teacherId: vine.string(),
                        subjectId: vine.string(),
                        subjectQuantity: vine.number(),
                      })
                    )
                    .optional(),
                })
              )
              .optional(),
          })
        ),
      })
    ),
  })
)
