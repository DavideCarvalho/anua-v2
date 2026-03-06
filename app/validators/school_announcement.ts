import vine from '@vinejs/vine'

export const listSchoolAnnouncementsValidator = vine.compile(
  vine.object({
    status: vine.enum(['DRAFT', 'PUBLISHED'] as const).optional(),
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
  })
)

export const createSchoolAnnouncementValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    body: vine.string().trim().minLength(1),
    requiresAcknowledgement: vine.boolean().optional(),
    acknowledgementDueAt: vine
      .date({ formats: { utc: true } })
      .optional()
      .nullable(),
    audienceAcademicPeriodIds: vine.array(vine.string().trim()).optional(),
    audienceCourseIds: vine.array(vine.string().trim()).optional(),
    audienceLevelIds: vine.array(vine.string().trim()).optional(),
    audienceClassIds: vine.array(vine.string().trim()).optional(),
  })
)

export const updateSchoolAnnouncementValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    body: vine.string().trim().minLength(1).optional(),
    requiresAcknowledgement: vine.boolean().optional(),
    acknowledgementDueAt: vine
      .date({ formats: { utc: true } })
      .optional()
      .nullable(),
    audienceAcademicPeriodIds: vine.array(vine.string().trim()).optional(),
    audienceCourseIds: vine.array(vine.string().trim()).optional(),
    audienceLevelIds: vine.array(vine.string().trim()).optional(),
    audienceClassIds: vine.array(vine.string().trim()).optional(),
  })
)
