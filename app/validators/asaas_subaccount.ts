import vine from '@vinejs/vine'

const companyTypes = ['MEI', 'LIMITED', 'INDIVIDUAL', 'ASSOCIATION'] as const

export const createAsaasSubaccountValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().trim().email().maxLength(255),
    cpfCnpj: vine.string().trim().minLength(11).maxLength(18),
    companyType: vine.enum(companyTypes),
    birthDate: vine.string().trim().optional(),
    phone: vine.string().trim().minLength(10).maxLength(20).optional(),
    mobilePhone: vine.string().trim().minLength(10).maxLength(20).optional(),
    address: vine.string().trim().minLength(3).maxLength(255),
    addressNumber: vine.string().trim().maxLength(20),
    complement: vine.string().trim().maxLength(255).optional(),
    province: vine.string().trim().minLength(2).maxLength(255),
    postalCode: vine.string().trim().minLength(8).maxLength(10),
    incomeValue: vine.number().min(0),
  })
)
