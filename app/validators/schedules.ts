import vine from '@vinejs/vine'

export const getClassScheduleValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string(),
  })
)

export const saveClassScheduleValidator = vine.compile(
  vine.object({
    academicPeriodId: vine.string(),
    slots: vine.array(
      vine.object({
        teacherHasClassId: vine.string().nullable(),
        classWeekDay: vine.number(),
        startTime: vine.string(),
        endTime: vine.string(),
      })
    ),
  })
)

export const validateTeacherScheduleConflictValidator = vine.compile(
  vine.object({
    teacherHasClassId: vine.string(),
    classWeekDay: vine.number(),
    startTime: vine.string(),
    endTime: vine.string(),
    academicPeriodId: vine.string(),
    classId: vine.string().optional(),
  })
)
