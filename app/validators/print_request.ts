import vine from '@vinejs/vine'

const statusEnum = vine.enum(['REQUESTED', 'APPROVED', 'REJECTED', 'PRINTED', 'REVIEW'] as const)

export const listPrintRequestsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    statuses: vine.array(statusEnum).optional(),
  })
)

export const createPrintRequestValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    fileUrl: vine.string().url(),
    quantity: vine.number().min(1),
    dueDate: vine.date(),
    frontAndBack: vine.boolean().optional(),
  })
)

export const reviewPrintRequestValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    fileUrl: vine.string().url(),
    quantity: vine.number().min(1),
    dueDate: vine.date(),
    frontAndBack: vine.boolean().optional(),
  })
)

export const rejectPrintRequestValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(1),
  })
)
