import vine from '@vinejs/vine'

export const updateEnrollmentValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim().optional(),
    scholarshipId: vine.string().trim().nullable().optional(),
    paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX'] as const).optional(),
    paymentDay: vine.number().min(1).max(31).optional(),
    installments: vine.number().min(1).max(12).optional(),
  })
)
