import vine from '@vinejs/vine'

export const createStudentBalanceTransactionValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    amount: vine.number(),
    type: vine.enum(['TOP_UP', 'CANTEEN_PURCHASE', 'STORE_PURCHASE', 'REFUND', 'ADJUSTMENT']),
    description: vine.string().trim().maxLength(500).optional(),
    responsibleId: vine.string().trim().optional(),
    paymentMethod: vine.string().trim().optional(),
  })
)

export const listStudentBalanceTransactionsValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    type: vine
      .enum(['TOP_UP', 'CANTEEN_PURCHASE', 'STORE_PURCHASE', 'REFUND', 'ADJUSTMENT'])
      .optional(),
    status: vine.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
