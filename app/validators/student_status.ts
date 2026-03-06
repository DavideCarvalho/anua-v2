import vine from '@vinejs/vine'

export const getStudentStatusValidator = vine.compile(
  vine.object({
    subjectId: vine.string().trim(),
    courseId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
  })
)
