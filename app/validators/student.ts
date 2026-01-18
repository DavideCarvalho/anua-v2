import vine from '@vinejs/vine'

export const createStudentValidator = vine.compile(
  vine.object({
    // User fields (will create a user too)
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().email().trim().optional(),
    phone: vine.string().trim().optional(),
    birthDate: vine.date().optional(),
    documentType: vine.string().trim().optional(),
    documentNumber: vine.string().trim().optional(),

    // Student specific fields
    discountPercentage: vine.number().min(0).max(100).optional(),
    monthlyPaymentAmount: vine.number().min(0).optional(),
    isSelfResponsible: vine.boolean().optional(),
    paymentDate: vine.number().min(1).max(31).optional(),
    classId: vine.string().uuid().optional(),
    contractId: vine.string().uuid().optional(),
    canteenLimit: vine.number().min(0).optional(),
    enrollmentStatus: vine.enum(['PENDING_DOCUMENT_REVIEW', 'REGISTERED']).optional(),

    // School context
    schoolId: vine.string().uuid().optional(),
  })
)

export const updateStudentValidator = vine.compile(
  vine.object({
    // User fields
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    email: vine.string().email().trim().optional(),
    phone: vine.string().trim().optional(),
    birthDate: vine.date().optional(),
    documentType: vine.string().trim().optional(),
    documentNumber: vine.string().trim().optional(),

    // Student specific fields
    discountPercentage: vine.number().min(0).max(100).optional(),
    monthlyPaymentAmount: vine.number().min(0).optional(),
    isSelfResponsible: vine.boolean().optional(),
    paymentDate: vine.number().min(1).max(31).optional(),
    classId: vine.string().uuid().optional(),
    contractId: vine.string().uuid().optional(),
    canteenLimit: vine.number().min(0).optional(),
    balance: vine.number().optional(),
    enrollmentStatus: vine.enum(['PENDING_DOCUMENT_REVIEW', 'REGISTERED']).optional(),
  })
)
