import vine from '@vinejs/vine'

// Config validators
export const getInsuranceConfigValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
  })
)

export const updateSchoolInsuranceValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
    hasInsurance: vine.boolean().optional(),
    insurancePercentage: vine.number().min(3).max(100).optional(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional(),
    insuranceClaimWaitingDays: vine.number().min(0).max(365).optional(),
  })
)

export const updateSchoolChainInsuranceValidator = vine.compile(
  vine.object({
    chainId: vine.string(),
    hasInsuranceByDefault: vine.boolean().optional(),
    insurancePercentage: vine.number().min(3).max(100).optional().nullable(),
    insuranceCoveragePercentage: vine.number().min(0).max(100).optional().nullable(),
    insuranceClaimWaitingDays: vine.number().min(0).max(365).optional().nullable(),
  })
)

export const resetSchoolInsuranceValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
  })
)

// Claims validators
export const listInsuranceClaimsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    status: vine.enum(['PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

export const approveInsuranceClaimValidator = vine.compile(
  vine.object({
    claimId: vine.string(),
    notes: vine.string().optional(),
  })
)

export const rejectInsuranceClaimValidator = vine.compile(
  vine.object({
    claimId: vine.string(),
    rejectionReason: vine.string().minLength(10),
  })
)

export const markClaimPaidValidator = vine.compile(
  vine.object({
    claimId: vine.string(),
    notes: vine.string().optional(),
  })
)

// Billings validators
export const listInsuranceBillingsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    status: vine.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const).optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

export const getBillingDetailsValidator = vine.compile(
  vine.object({
    billingId: vine.string(),
  })
)

// Analytics validators
export const getDefaultRateBySchoolValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(50).optional(),
  })
)

export const getSchoolsWithoutInsuranceValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(50).optional(),
  })
)

// School-specific validators
export const getSchoolInsuranceStatsValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
  })
)

export const getSchoolInsuranceBillingsValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
    limit: vine.number().optional(),
  })
)

export const getSchoolInsuranceClaimsValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
    status: vine.enum(['PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).optional(),
    limit: vine.number().optional(),
  })
)
