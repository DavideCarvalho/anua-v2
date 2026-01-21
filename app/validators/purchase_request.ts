import vine from '@vinejs/vine'

export const createPurchaseRequestValidator = vine.compile(
  vine.object({
    productName: vine.string().trim().minLength(1).maxLength(255),
    quantity: vine.number().positive(),
    unitValue: vine.number().min(0),
    value: vine.number().min(0),
    dueDate: vine.date(),
    productUrl: vine.string().trim().url().maxLength(1000).optional(),
    description: vine.string().trim().optional(),
    schoolId: vine.string(),
  })
)

export const updatePurchaseRequestValidator = vine.compile(
  vine.object({
    productName: vine.string().trim().minLength(1).maxLength(255).optional(),
    quantity: vine.number().positive().optional(),
    unitValue: vine.number().min(0).optional(),
    value: vine.number().min(0).optional(),
    dueDate: vine.date().optional(),
    productUrl: vine.string().trim().url().maxLength(1000).optional().nullable(),
    description: vine.string().trim().optional().nullable(),
  })
)

export const rejectPurchaseRequestValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(1),
  })
)

export const markAsBoughtValidator = vine.compile(
  vine.object({
    finalQuantity: vine.number().positive(),
    finalUnitValue: vine.number().min(0),
    finalValue: vine.number().min(0),
    estimatedArrivalDate: vine.date(),
    receiptPath: vine.string().trim().optional(),
  })
)

export const markAsArrivedValidator = vine.compile(
  vine.object({
    arrivalDate: vine.date(),
  })
)
