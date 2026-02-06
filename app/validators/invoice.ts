import vine from '@vinejs/vine'

export const listInvoicesValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    studentIds: vine.string().trim().optional(),
    search: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
    status: vine.string().trim().optional(),
    type: vine.enum(['MONTHLY', 'UPFRONT']).optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const markInvoicePaidValidator = vine.compile(
  vine.object({
    paymentMethod: vine.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER']),
    netAmountReceived: vine.number().min(0),
    observation: vine.string().trim().optional(),
  })
)
