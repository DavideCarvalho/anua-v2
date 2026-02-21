import vine from '@vinejs/vine'

export const listInvoicesValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    studentIds: vine.string().trim().optional(),
    search: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
    academicPeriodId: vine.string().trim().optional(),
    courseId: vine.string().trim().optional(),
    classId: vine.string().trim().optional(),
    status: vine.string().trim().optional(),
    type: vine.enum(['MONTHLY', 'UPFRONT']).optional(),
    sortBy: vine
      .enum(['dueDate', 'baseAmount', 'discountAmount', 'totalAmount', 'status', 'month', 'year'])
      .optional(),
    sortDirection: vine.enum(['asc', 'desc']).optional(),
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
    paidAt: vine.date(),
    observation: vine.string().trim().optional(),
  })
)
