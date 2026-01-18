import vine from '@vinejs/vine'

export const assignResponsibleValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    responsibleId: vine.string().trim(),
    isPedagogical: vine.boolean().optional(),
    isFinancial: vine.boolean().optional(),
  })
)

export const updateResponsibleAssignmentValidator = vine.compile(
  vine.object({
    isPedagogical: vine.boolean().optional(),
    isFinancial: vine.boolean().optional(),
  })
)

export const createResponsibleAddressValidator = vine.compile(
  vine.object({
    responsibleId: vine.string().trim(),
    street: vine.string().trim().minLength(2),
    number: vine.string().trim(),
    complement: vine.string().trim().optional(),
    neighborhood: vine.string().trim().minLength(2),
    city: vine.string().trim().minLength(2),
    state: vine.string().trim().minLength(2).maxLength(2),
    zipCode: vine
      .string()
      .trim()
      .regex(/^[0-9]{5}-?[0-9]{3}$/),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
  })
)

export const updateResponsibleAddressValidator = vine.compile(
  vine.object({
    street: vine.string().trim().minLength(2).optional(),
    number: vine.string().trim().optional(),
    complement: vine.string().trim().optional(),
    neighborhood: vine.string().trim().minLength(2).optional(),
    city: vine.string().trim().minLength(2).optional(),
    state: vine.string().trim().minLength(2).maxLength(2).optional(),
    zipCode: vine
      .string()
      .trim()
      .regex(/^[0-9]{5}-?[0-9]{3}$/)
      .optional(),
    latitude: vine.number().optional(),
    longitude: vine.number().optional(),
  })
)

export const createResponsibleDocumentValidator = vine.compile(
  vine.object({
    responsibleId: vine.string().trim(),
    documentType: vine.string().trim().in(['RG', 'CPF', 'CNH', 'PASSPORT', 'OTHER']),
    documentNumber: vine.string().trim(),
    issuingAgency: vine.string().trim().optional(),
    issueDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    expiryDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    filePath: vine.string().trim().optional(),
    verified: vine.boolean().optional(),
    observations: vine.string().trim().optional(),
  })
)

export const updateResponsibleDocumentValidator = vine.compile(
  vine.object({
    documentType: vine.string().trim().in(['RG', 'CPF', 'CNH', 'PASSPORT', 'OTHER']).optional(),
    documentNumber: vine.string().trim().optional(),
    issuingAgency: vine.string().trim().optional(),
    issueDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    expiryDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    filePath: vine.string().trim().optional(),
    verified: vine.boolean().optional(),
    observations: vine.string().trim().optional(),
  })
)
