import vine from '@vinejs/vine'

export const getTeachersTimesheetValidator = vine.compile(
  vine.object({
    month: vine.number().min(1).max(12),
    year: vine.number().min(2000).max(2100),
    academicPeriodIds: vine.array(vine.string().trim()).minLength(1),
  })
)

export const getTeacherAbsencesValidator = vine.compile(
  vine.object({
    teacherId: vine.string().trim(),
    month: vine.number().min(1).max(12),
    year: vine.number().min(2000).max(2100),
  })
)

export const approveAbsenceValidator = vine.compile(
  vine.object({
    absenceId: vine.string().trim(),
  })
)

export const rejectAbsenceValidator = vine.compile(
  vine.object({
    absenceId: vine.string().trim(),
    rejectionReason: vine.string().trim().minLength(3),
  })
)
