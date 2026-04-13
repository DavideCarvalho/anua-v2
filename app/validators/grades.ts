import vine from '@vinejs/vine'

export const getAcademicOverviewValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    academicPeriodId: vine.string().uuid().optional(),
    classId: vine.string().uuid().optional(),
  })
)

export const getStudentsGradesValidator = vine.compile(
  vine.object({
    classId: vine.string(),
    subjectId: vine.string().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

export const getGradeDistributionValidator = vine.compile(
  vine.object({
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
    academicPeriodId: vine.string().uuid().optional(),
    classId: vine.string().uuid().optional(),
    subjectId: vine.string().uuid().optional(),
  })
)

export const getAtRiskStudentsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    schoolChainId: vine.string().optional(),
    academicPeriodId: vine.string().uuid().optional(),
    classId: vine.string().uuid().optional(),
    minimumGrade: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

export const getGradeTrendsValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string().uuid().optional(),
    classId: vine.string().uuid().optional(),
  })
)

export const batchSaveGradesValidator = vine.compile(
  vine.object({
    assignmentId: vine.string().trim(),
    grades: vine.array(
      vine.object({
        studentId: vine.string().trim(),
        grade: vine.number().min(0).nullable(),
        submittedAt: vine.string().trim().nullable().optional(),
        recoveryGrade: vine.number().min(0).max(10).optional().nullable(),
        recoveryGradeDate: vine
          .date({ formats: ['iso8601'] })
          .optional()
          .nullable(),
      })
    ),
  })
)

export const getClassGradesBySubjectValidator = vine.compile(
  vine.object({
    courseId: vine.string().uuid(),
    academicPeriodId: vine.string().uuid(),
  })
)
