import vine from '@vinejs/vine'

export const createWalletTopUpValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    amount: vine.number().min(100).max(10_000_00),
    paymentMethod: vine.enum(['PIX', 'BOLETO']),
  })
)

export const listWalletTopUpsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
