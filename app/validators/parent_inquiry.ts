import vine from '@vinejs/vine'

const attachmentSchema = vine.object({
  fileName: vine.string(),
  filePath: vine.string(),
  fileSize: vine.number(),
  mimeType: vine.string(),
})

export const createInquiryValidator = vine.compile(
  vine.object({
    subject: vine.string().trim().minLength(3).maxLength(255),
    body: vine.string(),
    attachments: vine.array(attachmentSchema).optional(),
  })
)

export const createMessageValidator = vine.compile(
  vine.object({
    body: vine.string(),
    attachments: vine.array(attachmentSchema).optional(),
  })
)

export const listInquiriesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    status: vine.enum(['OPEN', 'RESOLVED', 'CLOSED', 'ALL']).optional(),
  })
)
