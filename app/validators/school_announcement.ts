import vine from '@vinejs/vine'

export const listSchoolAnnouncementsValidator = vine.create({
  status: vine.enum(['DRAFT', 'PUBLISHED'] as const).optional(),
  page: vine.number().positive().optional(),
  limit: vine.number().positive().max(100).optional(),
})

export const createSchoolAnnouncementValidator = vine.create({
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
  audienceStudentIds: vine.array(vine.string().trim()).optional(),
  attachments: vine
    .array(
      vine.file({
        size: '10mb',
        extnames: ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(5)
    .optional(),
})

export const updateSchoolAnnouncementValidator = vine.create({
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
  audienceStudentIds: vine.array(vine.string().trim()).optional(),
  removedAttachmentIds: vine.array(vine.string().trim()).optional(),
  attachments: vine
    .array(
      vine.file({
        size: '10mb',
        extnames: ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
      })
    )
    .maxLength(5)
    .optional(),
})
