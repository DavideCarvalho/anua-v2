import vine from '@vinejs/vine'

export const createCourseHasAcademicPeriodValidator = vine.compile(
  vine.object({
    courseId: vine.string().trim(),
    academicPeriodId: vine.string().trim(),
  })
)
