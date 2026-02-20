import vine from '@vinejs/vine'

export const createAgreementValidator = vine.compile(
  vine.object({
    invoiceIds: vine.array(vine.string().trim()).minLength(1),
    installments: vine.number().min(1).max(36),
    startDate: vine.date(),
    paymentDay: vine.number().min(1).max(31),
    paymentMethod: vine.enum(['PIX', 'BOLETO']).optional(),
    renegotiationDiscountType: vine.enum(['PERCENTAGE', 'FLAT']).optional().nullable(),
    renegotiationDiscountValue: vine.number().min(1).optional().nullable(),
    finePercentage: vine.number().min(0).max(100).optional(),
    dailyInterestPercentage: vine.number().min(0).max(100).optional(),
    earlyDiscounts: vine
      .array(
        vine.object({
          discountType: vine.enum(['PERCENTAGE', 'FLAT']),
          percentage: vine.number().min(1).max(100).optional().nullable(),
          flatAmount: vine.number().min(1).optional().nullable(),
          daysBeforeDeadline: vine.number().min(1).max(30),
        })
      )
      .optional(),
  })
)
