import vine from '@vinejs/vine'

export const createAssignmentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(2000).optional(),
    instructions: vine.string().trim().maxLength(2000).optional(),
    maxScore: vine.number().min(0).optional().nullable(),
    status: vine.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    dueDate: vine.date({ formats: ['iso8601'] }),
    classId: vine.string().trim(),
    subjectId: vine.string().trim(),
    teacherId: vine.string().trim(),
    academicPeriodId: vine.string().trim().optional(),
    subPeriodId: vine.string().uuid().optional().nullable(),
  })
)

export const updateAssignmentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(2000).optional().nullable(),
    instructions: vine.string().trim().maxLength(2000).optional().nullable(),
    maxScore: vine.number().min(0).optional().nullable(),
    status: vine.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    dueDate: vine.date({ formats: ['iso8601'] }).optional(),
    subPeriodId: vine.string().uuid().optional().nullable(),
  })
)

export const submitAssignmentValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
  })
)

export const gradeSubmissionValidator = vine.compile(
  vine.object({
    grade: vine.number().min(0),
  })
)
