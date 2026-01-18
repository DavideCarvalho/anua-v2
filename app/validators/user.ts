import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
    phone: vine.string().trim().optional(),
    whatsappContact: vine.boolean().optional(),
    birthDate: vine.date().optional(),
    documentType: vine.string().trim().optional(),
    documentNumber: vine.string().trim().optional(),
    imageUrl: vine.string().url().optional(),
    grossSalary: vine.number().min(0).optional(),
    roleId: vine.string().uuid().optional(),
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    email: vine.string().email().trim().optional(),
    password: vine.string().minLength(6).optional(),
    phone: vine.string().trim().optional(),
    whatsappContact: vine.boolean().optional(),
    birthDate: vine.date().optional(),
    documentType: vine.string().trim().optional(),
    documentNumber: vine.string().trim().optional(),
    imageUrl: vine.string().url().optional(),
    active: vine.boolean().optional(),
    grossSalary: vine.number().min(0).optional(),
    roleId: vine.string().uuid().optional(),
    schoolId: vine.string().uuid().optional(),
    schoolChainId: vine.string().uuid().optional(),
  })
)
