import vine from '@vinejs/vine'

// Canteen validators
export const createCanteenValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    responsibleUserId: vine.string().trim(),
  })
)

export const updateCanteenValidator = vine.compile(
  vine.object({
    responsibleUserId: vine.string().trim().optional(),
  })
)

export const listCanteensValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// Canteen Item validators
export const createCanteenItemValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim(),
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(0), // Em centavos
    category: vine.string().trim().maxLength(100).optional(),
    isActive: vine.boolean().optional(),
    imageUrl: vine.string().trim().url().optional(),
    stockQuantity: vine.number().min(0).optional(), // null = ilimitado
  })
)

export const updateCanteenItemValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(0).optional(),
    category: vine.string().trim().maxLength(100).optional(),
    isActive: vine.boolean().optional(),
    imageUrl: vine.string().trim().url().optional(),
    stockQuantity: vine.number().min(0).optional(),
  })
)

export const listCanteenItemsValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim().optional(),
    category: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// Canteen Purchase validators
export const createCanteenPurchaseValidator = vine.compile(
  vine.object({
    userId: vine.string().trim(),
    canteenId: vine.string().trim(),
    paymentMethod: vine.enum(['BALANCE', 'CASH', 'CARD', 'PIX']),
    items: vine.array(
      vine.object({
        canteenItemId: vine.string().trim(),
        quantity: vine.number().min(1),
      })
    ),
  })
)

export const listCanteenPurchasesValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim().optional(),
    userId: vine.string().trim().optional(),
    status: vine.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
    paymentMethod: vine.enum(['BALANCE', 'CASH', 'CARD', 'PIX']).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const updateCanteenPurchaseStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'PAID', 'CANCELLED']),
  })
)

// Canteen Meal validators
export const createCanteenMealValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim(),
    name: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(0),
    servedAt: vine.date(),
    isActive: vine.boolean().optional(),
    maxReservations: vine.number().min(1).optional(),
  })
)

export const updateCanteenMealValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    price: vine.number().min(0).optional(),
    servedAt: vine.date().optional(),
    isActive: vine.boolean().optional(),
    maxReservations: vine.number().min(1).optional(),
  })
)

export const listCanteenMealsValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim().optional(),
    servedAt: vine.date().optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// Canteen Meal Reservation validators
export const createCanteenMealReservationValidator = vine.compile(
  vine.object({
    canteenMealId: vine.string().trim(),
    userId: vine.string().trim(),
    quantity: vine.number().min(1).optional(),
  })
)

export const updateCanteenMealReservationStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'CONSUMED']),
  })
)

export const listCanteenMealReservationsValidator = vine.compile(
  vine.object({
    canteenMealId: vine.string().trim().optional(),
    userId: vine.string().trim().optional(),
    status: vine.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'CONSUMED']).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const getCanteenReportValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    topItemsLimit: vine.number().min(1).max(20).optional(),
  })
)

export const createCanteenMonthlyTransferValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim(),
    month: vine.number().min(1).max(12),
    year: vine.number().min(2020).max(2100),
  })
)

export const listCanteenMonthlyTransfersValidator = vine.compile(
  vine.object({
    canteenId: vine.string().trim().optional(),
    status: vine.enum(['PENDING', 'TRANSFERRED', 'CANCELLED']).optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const updateCanteenMonthlyTransferStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'TRANSFERRED', 'CANCELLED']),
  })
)
