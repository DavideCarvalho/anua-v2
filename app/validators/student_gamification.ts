import vine from '@vinejs/vine'

export const createStudentGamificationValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
  })
)
