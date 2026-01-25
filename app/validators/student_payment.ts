import vine from '@vinejs/vine'

export const createStudentPaymentValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim(),
    amount: vine.number().positive(),
    month: vine.number().min(1).max(12),
    year: vine.number().min(2020).max(2100),
    type: vine.enum([
      'ENROLLMENT',
      'TUITION',
      'CANTEEN',
      'COURSE',
      'AGREEMENT',
      'STUDENT_LOAN',
      'OTHER',
    ]),
    totalAmount: vine.number().positive(),
    dueDate: vine.date(),
    installments: vine.number().min(1).optional(),
    installmentNumber: vine.number().min(1).optional(),
    discountPercentage: vine.number().min(0).max(100).optional(),
    contractId: vine.string().trim(),
    classHasAcademicPeriodId: vine.string().trim().optional(),
    studentHasLevelId: vine.string().trim().optional(),
  })
)

export const updateStudentPaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().optional(),
    dueDate: vine.date().optional(),
    discountPercentage: vine.number().min(0).max(100).optional(),
    status: vine.enum(['NOT_PAID', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'FAILED']).optional(),
  })
)

export const listStudentPaymentsValidator = vine.compile(
  vine.object({
    studentId: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
    status: vine.enum(['NOT_PAID', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'FAILED']).optional(),
    type: vine
      .enum(['ENROLLMENT', 'TUITION', 'CANTEEN', 'COURSE', 'AGREEMENT', 'STUDENT_LOAN', 'OTHER'])
      .optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const markPaymentAsPaidValidator = vine.compile(
  vine.object({
    paidAt: vine.date().optional(),
    paymentGatewayId: vine.string().trim().optional(),
    paymentGateway: vine.enum(['ASAAS', 'CUSTOM']).optional(),
  })
)
