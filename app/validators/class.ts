import vine from '@vinejs/vine'

export const createClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    maxStudents: vine.number().min(1).optional(),
    status: vine.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    levelId: vine.string().trim().optional(),
    schoolId: vine.string().trim(),
  })
)

export const createClassWithTeachersValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    schoolId: vine.string().trim().minLength(1),
    subjectsWithTeachers: vine.array(
      vine.object({
        teacherId: vine.string().trim(),
        subjectId: vine.string().trim(),
        quantity: vine.number().min(1),
      })
    ),
  })
)

export const updateClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    maxStudents: vine.number().min(1).optional().nullable(),
    status: vine.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    subjectsWithTeachers: vine
      .array(
        vine.object({
          teacherId: vine.string().trim(),
          subjectId: vine.string().trim(),
          quantity: vine.number().min(1).max(20),
        })
      )
      .optional(),
  })
)

export const updateClassWithTeachersValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    subjectsWithTeachers: vine.array(
      vine.object({
        teacherId: vine.string().trim(),
        subjectId: vine.string().trim(),
        quantity: vine.number().min(1).max(20),
      })
    ),
  })
)
