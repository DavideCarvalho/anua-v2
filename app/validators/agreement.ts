import vine from '@vinejs/vine'

export const createAgreementValidator = vine.compile(
  vine.object({
    invoiceIds: vine.array(vine.string().trim()).minLength(1),
    installments: vine.number().min(1).max(36),
    startDate: vine.date(),
    paymentDay: vine.number().min(1).max(31),
    paymentMethod: vine.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER']).optional(),
    billingType: vine.enum(['UPFRONT', 'MONTHLY']).optional(),
    finePercentage: vine.number().min(0).max(100).optional(),
    dailyInterestPercentage: vine.number().min(0).max(100).optional(),
    earlyDiscounts: vine
      .array(
        vine.object({
          percentage: vine.number().min(1).max(100),
          daysBeforeDeadline: vine.number().min(1).max(30),
        })
      )
      .optional(),
  })
)
