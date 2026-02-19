import vine from '@vinejs/vine'

export const updateEnrollmentValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim().optional(),
    scholarshipId: vine.string().trim().nullable().optional(),
    paymentMethod: vine.enum(['BOLETO', 'PIX'] as const).optional(),
    paymentDay: vine.number().min(1).max(31).optional(),
    installments: vine.number().min(1).max(12).optional(),
    individualDiscount: vine
      .object({
        name: vine.string().trim().optional(),
        discountType: vine.enum(['PERCENTAGE', 'FLAT'] as const),
        discountPercentage: vine.number().min(0).max(100).optional(),
        discountValue: vine.number().min(0).optional(),
      })
      .nullable()
      .optional(),
  })
)
