import vine from '@vinejs/vine'

export const finishEnrollmentValidator = vine.compile(
  vine.object({
    // Student info
    student: vine.object({
      name: vine.string().minLength(3),
      email: vine.string().email(),
      phone: vine.string().optional(),
      birthDate: vine.string(),
      documentType: vine.enum(['CPF', 'RG', 'PASSPORT', 'OTHER']),
      document: vine.string(),
      isSelfResponsible: vine.boolean(),
    }),

    // Guardian/Responsible info (array because there can be multiple)
    responsibles: vine.array(
      vine.object({
        name: vine.string().minLength(3),
        email: vine.string().email(),
        phone: vine.string(),
        birthDate: vine.string().optional(),
        documentType: vine.enum(['CPF', 'RG', 'PASSPORT', 'OTHER']),
        document: vine.string(),
        isPedagogical: vine.boolean(),
        isFinancial: vine.boolean(),
      })
    ),

    // Address
    address: vine.object({
      street: vine.string(),
      number: vine.string(),
      complement: vine.string().optional(),
      neighborhood: vine.string(),
      city: vine.string(),
      state: vine.string(),
      zipCode: vine.string(),
      latitude: vine.number().optional(),
      longitude: vine.number().optional(),
    }),

    // Medical info
    medicalInfo: vine
      .object({
        conditions: vine.string().optional(),
        medications: vine
          .array(
            vine.object({
              name: vine.string(),
              dosage: vine.string(),
              frequency: vine.string(),
              instructions: vine.string().optional(),
            })
          )
          .optional(),
      })
      .optional(),

    // Emergency contacts
    emergencyContacts: vine.array(
      vine.object({
        name: vine.string(),
        phone: vine.string(),
        relationship: vine.enum([
          'MOTHER',
          'FATHER',
          'GRANDMOTHER',
          'GRANDFATHER',
          'AUNT',
          'UNCLE',
          'COUSIN',
          'NEPHEW',
          'NIECE',
          'GUARDIAN',
          'OTHER',
        ]),
        responsibleIndex: vine.number().optional(),
      })
    ),

    // Billing/Payment
    billing: vine.object({
      paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX']),
      paymentDay: vine.number().min(1).max(31).optional(),
      enrollmentInstallments: vine.number().min(1).optional(),
      installments: vine.number().min(1).optional(),
      scholarshipCode: vine.string().optional(),
    }),

    // School/Course info
    schoolId: vine.string(),
    academicPeriodId: vine.string(),
    courseId: vine.string(),
    levelId: vine.string(),
    contractId: vine.string().optional(),
  })
)

export const listEnrollmentsValidator = vine.compile(
  vine.object({
    schoolId: vine.string(),
    academicPeriodId: vine.string().optional(),
    status: vine.enum(['PENDING_DOCUMENT_REVIEW', 'REGISTERED'] as const).optional(),
    levelId: vine.string().optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

export const updateDocumentStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['APPROVED', 'REJECTED'] as const),
    rejectionReason: vine.string().optional(),
  })
)
