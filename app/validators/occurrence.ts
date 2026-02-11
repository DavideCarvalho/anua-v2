import vine from '@vinejs/vine'

const occurrenceTypes = ['BEHAVIOR', 'PERFORMANCE', 'ABSENCE', 'LATE', 'OTHER'] as const

export const listOccurrencesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().optional(),
    type: vine.enum(occurrenceTypes).optional(),
    classId: vine.string().trim().optional(),
    studentId: vine.string().trim().optional(),
    teacherHasClassId: vine.string().trim().optional(),
    search: vine.string().trim().optional(),
    startDate: vine.date({ formats: ['iso8601'] }).optional(),
    endDate: vine.date({ formats: ['iso8601'] }).optional(),
  })
)

export const createOccurrenceValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    teacherHasClassId: vine.string().trim(),
    type: vine.enum(occurrenceTypes),
    text: vine.string().trim().minLength(3).maxLength(2000),
    date: vine.date({ formats: ['iso8601'] }),
  })
)
