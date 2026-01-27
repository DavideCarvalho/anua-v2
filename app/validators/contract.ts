import vine from '@vinejs/vine'

export const createContractValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim(),
    academicPeriodId: vine.string().trim().optional(),
    name: vine.string().trim().minLength(2),
    description: vine.string().trim().optional(),
    endDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    enrollmentValue: vine.number().min(0).optional(),
    amount: vine.number().min(0),
    docusealTemplateId: vine.string().trim().optional(),
    paymentType: vine.enum(['MONTHLY', 'UPFRONT']),
    enrollmentValueInstallments: vine.number().min(1).optional(),
    enrollmentPaymentUntilDays: vine.number().min(1).optional(),
    installments: vine.number().min(1).optional(),
    flexibleInstallments: vine.boolean().optional(),
    hasInsurance: vine.boolean().optional(),
    isActive: vine.boolean().optional(),
    // Nested data
    paymentDays: vine.array(vine.number().min(1).max(31)).optional(),
    interestConfig: vine
      .object({
        delayInterestPercentage: vine.number().min(0).optional(),
        delayInterestPerDayDelayed: vine.number().min(0).optional(),
      })
      .optional(),
    earlyDiscounts: vine
      .array(
        vine.object({
          percentage: vine.number().min(0).max(100),
          daysBeforeDeadline: vine.number().min(1),
        })
      )
      .optional(),
  })
)

export const updateContractValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).optional(),
    description: vine.string().trim().optional(),
    endDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional(),
    enrollmentValue: vine.number().min(0).optional(),
    amount: vine.number().min(0).optional(),
    docusealTemplateId: vine.string().trim().optional(),
    paymentType: vine.enum(['MONTHLY', 'UPFRONT']).optional(),
    enrollmentValueInstallments: vine.number().min(1).optional(),
    enrollmentPaymentUntilDays: vine.number().min(1).optional(),
    installments: vine.number().min(1).optional(),
    flexibleInstallments: vine.boolean().optional(),
    isActive: vine.boolean().optional(),
    hasInsurance: vine.boolean().optional(),
    paymentDays: vine.array(vine.number().min(1).max(31)).optional(),
  })
)

export const createContractDocumentValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    description: vine.string().trim().optional(),
    required: vine.boolean().optional(),
    schoolId: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
  })
)

export const updateContractDocumentValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).optional(),
    description: vine.string().trim().optional(),
    required: vine.boolean().optional(),
    schoolId: vine.string().trim().optional(),
    contractId: vine.string().trim().optional(),
  })
)

export const createContractPaymentDayValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim(),
    day: vine.number().min(1).max(31),
  })
)

export const syncContractPaymentDaysValidator = vine.compile(
  vine.object({
    days: vine.array(vine.number().min(1).max(31)).minLength(1),
  })
)

export const createContractInterestConfigValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim(),
    delayInterestPercentage: vine.number().min(0).optional(),
    delayInterestPerDayDelayed: vine.number().min(0).optional(),
  })
)

export const updateContractInterestConfigValidator = vine.compile(
  vine.object({
    delayInterestPercentage: vine.number().min(0).optional(),
    delayInterestPerDayDelayed: vine.number().min(0).optional(),
  })
)

export const createContractEarlyDiscountValidator = vine.compile(
  vine.object({
    contractId: vine.string().trim(),
    percentage: vine.number().min(0).max(100),
    daysBeforeDeadline: vine.number().min(1),
  })
)

export const updateContractEarlyDiscountValidator = vine.compile(
  vine.object({
    percentage: vine.number().min(0).max(100).optional(),
    daysBeforeDeadline: vine.number().min(1).optional(),
  })
)

export const listContractsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().trim().optional(),
    academicPeriodId: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
