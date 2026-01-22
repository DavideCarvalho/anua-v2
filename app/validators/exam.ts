import vine from '@vinejs/vine'

export const createExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    instructions: vine.string().trim().maxLength(2000).optional(),
    maxScore: vine.number().min(0),
    type: vine.enum(['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ']),
    status: vine.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledDate: vine.date({ formats: ['iso8601'] }),
    durationMinutes: vine.number().min(1).optional(),
    classId: vine.string().trim(),
    subjectId: vine.string().trim(),
    teacherId: vine.string().trim(),
    academicPeriodId: vine.string().trim().optional(),
  })
)

export const updateExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    instructions: vine.string().trim().maxLength(2000).optional().nullable(),
    maxScore: vine.number().min(0).optional(),
    type: vine.enum(['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ']).optional(),
    status: vine.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledDate: vine.date().optional(),
    durationMinutes: vine.number().min(1).optional().nullable(),
  })
)

export const saveExamGradeValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    score: vine.number().min(0),
    feedback: vine.string().trim().maxLength(1000).optional(),
    absent: vine.boolean().optional(),
  })
)

export const batchSaveExamGradesValidator = vine.compile(
  vine.object({
    grades: vine.array(
      vine.object({
        studentId: vine.string().trim(),
        score: vine.number().min(0),
        feedback: vine.string().trim().maxLength(1000).optional(),
        absent: vine.boolean().optional(),
      })
    ),
  })
)
