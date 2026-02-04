import vine from '@vinejs/vine'

// ==========================================
// Enums
// ==========================================
const subscriptionTiers = ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'] as const
const subscriptionStatuses = [
  'TRIAL',
  'ACTIVE',
  'PAST_DUE',
  'BLOCKED',
  'CANCELED',
  'PAUSED',
] as const
const billingCycles = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'] as const
const invoiceStatuses = ['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'REFUNDED'] as const
const paymentMethods = ['BOLETO', 'CREDIT_CARD', 'PIX'] as const

// ==========================================
// Platform Settings Validators
// ==========================================
export const updatePlatformSettingsValidator = vine.compile(
  vine.object({
    defaultTrialDays: vine.number().min(0).optional(),
    defaultPricePerStudent: vine.number().min(0).optional(),
    defaultStorePlatformFeePercentage: vine.number().min(0).max(100).optional(),
  })
)

// ==========================================
// Payment Settings Validators
// ==========================================
export const createPaymentSettingsValidator = vine.compile(
  vine.object({
    pricePerStudent: vine.number().min(0),
    trialDays: vine.number().min(0).optional(),
    discount: vine.number().min(0).max(100).optional(),
    platformFeePercentage: vine.number().min(0).max(100).optional(),
    schoolId: vine.string().trim().optional(),
    schoolChainId: vine.string().trim().optional(),
  })
)

export const updatePaymentSettingsValidator = vine.compile(
  vine.object({
    pricePerStudent: vine.number().min(0).optional(),
    trialDays: vine.number().min(0).optional(),
    discount: vine.number().min(0).max(100).optional(),
    platformFeePercentage: vine.number().min(0).max(100).optional(),
    isActive: vine.boolean().optional(),
  })
)

// ==========================================
// Subscription Plan Validators
// ==========================================
export const createSubscriptionPlanValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    tier: vine.enum(subscriptionTiers),
    description: vine.string().trim().maxLength(2000).optional(),
    monthlyPrice: vine.number().min(0),
    annualPrice: vine.number().min(0).optional(),
    maxStudents: vine.number().min(1).optional(),
    maxTeachers: vine.number().min(1).optional(),
    maxSchoolsInChain: vine.number().min(1).optional(),
    features: vine.any(), // JSON object
    isActive: vine.boolean().optional(),
  })
)

export const updateSubscriptionPlanValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    tier: vine.enum(subscriptionTiers).optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    monthlyPrice: vine.number().min(0).optional(),
    annualPrice: vine.number().min(0).optional(),
    maxStudents: vine.number().min(1).optional(),
    maxTeachers: vine.number().min(1).optional(),
    maxSchoolsInChain: vine.number().min(1).optional(),
    features: vine.any().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listSubscriptionPlansValidator = vine.compile(
  vine.object({
    tier: vine.enum(subscriptionTiers).optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Subscription Validators
// ==========================================
export const createSubscriptionValidator = vine.compile(
  vine.object({
    planId: vine.string().trim().optional(),
    schoolId: vine.string().trim().optional(),
    schoolChainId: vine.string().trim().optional(),
    billingCycle: vine.enum(billingCycles).optional(),
    pricePerStudent: vine.number().min(0),
    discount: vine.number().min(0).max(100).optional(),
    paymentMethod: vine.enum(paymentMethods).optional(),
  })
)

export const updateSubscriptionValidator = vine.compile(
  vine.object({
    planId: vine.string().trim().optional(),
    billingCycle: vine.enum(billingCycles).optional(),
    pricePerStudent: vine.number().min(0).optional(),
    discount: vine.number().min(0).max(100).optional(),
    paymentMethod: vine.enum(paymentMethods).optional(),
    creditCardToken: vine.string().trim().optional(),
    creditCardHolderName: vine.string().trim().optional(),
  })
)

export const listSubscriptionsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    schoolChainId: vine.string().trim().optional(),
    status: vine.enum(subscriptionStatuses).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const changeSubscriptionStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(subscriptionStatuses),
    reason: vine.string().trim().maxLength(1000).optional(),
  })
)

// ==========================================
// Subscription Invoice Validators
// ==========================================
export const createSubscriptionInvoiceValidator = vine.compile(
  vine.object({
    subscriptionId: vine.string().trim(),
    academicPeriodId: vine.string().trim().optional(),
    month: vine.number().min(1).max(12),
    year: vine.number().min(2020).max(2100),
    activeStudents: vine.number().min(0).optional(),
    amount: vine.number().min(0),
    dueDate: vine.date(),
    description: vine.string().trim().maxLength(1000).optional(),
  })
)

export const updateSubscriptionInvoiceValidator = vine.compile(
  vine.object({
    status: vine.enum(invoiceStatuses).optional(),
    paidAt: vine.date().optional(),
    invoiceUrl: vine.string().trim().url().optional(),
    paymentGatewayId: vine.string().trim().optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    paymentMethodSnapshot: vine.enum(paymentMethods).optional(),
  })
)

export const listSubscriptionInvoicesValidator = vine.compile(
  vine.object({
    subscriptionId: vine.string().trim().optional(),
    status: vine.enum(invoiceStatuses).optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// School Usage Metrics Validators
// ==========================================
export const getSchoolUsageMetricsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
  })
)

export const updateSchoolUsageMetricsValidator = vine.compile(
  vine.object({
    activeStudents: vine.number().min(0).optional(),
    activeTeachers: vine.number().min(0).optional(),
    activeUsers: vine.number().min(0).optional(),
    classesCreated: vine.number().min(0).optional(),
    assignmentsCreated: vine.number().min(0).optional(),
    attendanceRecords: vine.number().min(0).optional(),
    totalRevenue: vine.number().min(0).optional(),
    totalEnrollments: vine.number().min(0).optional(),
    loginCount: vine.number().min(0).optional(),
  })
)

// ==========================================
// Admin Subscription Management Validators
// ==========================================
export const cancelSubscriptionValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(1).maxLength(1000),
  })
)

export const pauseSubscriptionValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().maxLength(1000).optional(),
  })
)

export const reactivateSubscriptionValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().maxLength(1000).optional(),
  })
)
