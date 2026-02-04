import vine from '@vinejs/vine'

// ==========================================
// Store Validators
// ==========================================
export const createStoreValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    type: vine.enum(['INTERNAL', 'THIRD_PARTY']),
    ownerUserId: vine.string().trim().optional(),
    commissionPercentage: vine.number().min(0).max(100).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateStoreValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    type: vine.enum(['INTERNAL', 'THIRD_PARTY']).optional(),
    ownerUserId: vine.string().trim().optional(),
    commissionPercentage: vine.number().min(0).max(100).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listStoresValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    type: vine.enum(['INTERNAL', 'THIRD_PARTY']).optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

// ==========================================
// Store Owner Financial Settings Validators
// ==========================================
export const updateOwnFinancialSettingsValidator = vine.compile(
  vine.object({
    pixKey: vine.string().trim().optional(),
    pixKeyType: vine.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
    bankName: vine.string().trim().maxLength(255).optional(),
    accountHolder: vine.string().trim().maxLength(255).optional(),
  })
)

// ==========================================
// Store Financial Settings Validators
// ==========================================
export const upsertStoreFinancialSettingsValidator = vine.compile(
  vine.object({
    platformFeePercentage: vine.number().min(0).max(100).optional(),
    pixKey: vine.string().trim().optional(),
    pixKeyType: vine.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
    bankName: vine.string().trim().maxLength(255).optional(),
    accountHolder: vine.string().trim().maxLength(255).optional(),
  })
)

// ==========================================
// Store Settlement Validators
// ==========================================
export const createStoreSettlementValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim(),
    month: vine.number().min(1).max(12),
    year: vine.number().min(2020).max(2100),
  })
)

export const listStoreSettlementsValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim().optional(),
    status: vine
      .enum(['PENDING', 'APPROVED', 'PROCESSING', 'TRANSFERRED', 'FAILED', 'CANCELLED'])
      .optional(),
    month: vine.number().min(1).max(12).optional(),
    year: vine.number().min(2020).max(2100).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)

export const updateStoreSettlementStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'APPROVED', 'PROCESSING', 'TRANSFERRED', 'FAILED', 'CANCELLED']),
    notes: vine.string().trim().maxLength(1000).optional(),
  })
)

// ==========================================
// Store Installment Rule Validators
// ==========================================
export const createStoreInstallmentRuleValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim(),
    minAmount: vine.number().min(0),
    maxInstallments: vine.number().min(2).max(24),
    isActive: vine.boolean().optional(),
  })
)

export const updateStoreInstallmentRuleValidator = vine.compile(
  vine.object({
    minAmount: vine.number().min(0).optional(),
    maxInstallments: vine.number().min(2).max(24).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listStoreInstallmentRulesValidator = vine.compile(
  vine.object({
    storeId: vine.string().trim(),
  })
)
