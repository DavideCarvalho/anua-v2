import vine from '@vinejs/vine'

export const createAsaasChargeValidator = vine.compile(
  vine.object({
    billingType: vine.enum(['BOLETO', 'PIX']).optional(),
  })
)

export const sendAsaasBoletoEmailValidator = vine.compile(
  vine.object({
    email: vine.string().email().optional(),
  })
)
