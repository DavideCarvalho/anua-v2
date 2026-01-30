import vine from '@vinejs/vine'

export const createAgreementValidator = vine.compile(
  vine.object({
    paymentIds: vine.array(vine.string().trim()).minLength(1),
    installments: vine.number().min(1).max(36),
    startDate: vine.date(),
    paymentDay: vine.number().min(1).max(31),
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
