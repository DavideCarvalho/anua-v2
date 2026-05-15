import vine from '@vinejs/vine'

export const listAttendanceValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    calendarSlotId: vine.string().trim().optional(),
    studentId: vine.string().trim().optional(),
    date: vine.string().trim().optional(),
    status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']).optional(),
  })
)

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
    reason: vine.string().trim().maxLength(500).optional().nullable(),
    classId: vine.string().trim().optional(),
  })
)

export const batchCreateAttendanceValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
    subjectId: vine.string().trim().optional(),
    subjectIds: vine.array(vine.string().trim()).optional(),
    dates: vine.array(vine.date({ formats: ['iso8601'] })).minLength(1),
    attendances: vine.array(
      vine.object({
        studentId: vine.string().trim(),
        status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED']),
        justification: vine.string().trim().maxLength(500).optional(),
      })
    ),
  })
)

export const getClassStudentsAttendanceValidator = vine.compile(
  vine.object({
    courseId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    subPeriodId: vine.string().trim().optional(),
    sortBy: vine
      .enum(['name', 'present', 'absent', 'late', 'justified', 'percentage'])
      .optional(),
    sortDir: vine.enum(['asc', 'desc']).optional(),
  })
)

export const getStudentHistoryValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
    subPeriodId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const listLessonsValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
    subPeriodId: vine.string().trim().optional(),
    subjectId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    sortBy: vine.enum(['date', 'present', 'absent', 'late', 'justified']).optional(),
    sortDir: vine.enum(['asc', 'desc']).optional(),
  })
)

export const getLessonStudentsValidator = vine.compile(
  vine.object({
    classId: vine.string().trim(),
  })
)
