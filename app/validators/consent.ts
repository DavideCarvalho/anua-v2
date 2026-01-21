import vine from '@vinejs/vine'

export const listEventConsentsValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED'] as const).optional(),
  })
)

export const requestConsentValidator = vine.compile(
  vine.object({
    studentId: vine.string(),
    responsibleId: vine.string(),
  })
)

export const listConsentHistoryValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    status: vine.enum(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED'] as const).optional(),
    studentId: vine.string().optional(),
  })
)

export const respondConsentValidator = vine.compile(
  vine.object({
    approved: vine.boolean(),
    notes: vine.string().optional(),
  })
)
