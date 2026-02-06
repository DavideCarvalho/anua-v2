import vine from '@vinejs/vine'

export const marketplaceCheckoutValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    storeId: vine.string().trim(),
    items: vine.array(
      vine.object({
        storeItemId: vine.string().trim(),
        quantity: vine.number().min(1),
      })
    ),
    paymentMode: vine.enum(['IMMEDIATE', 'DEFERRED']).optional(),
    paymentMethod: vine.enum(['BALANCE', 'PIX', 'CASH', 'CARD']).optional(),
    installments: vine.number().min(1).max(24).optional(),
    spreadAcrossPeriod: vine.boolean().optional(),
    notes: vine.string().trim().maxLength(500).optional(),
  })
)
