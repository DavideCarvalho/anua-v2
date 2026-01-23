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

// Validator for full student update (similar to enroll but for updates)
export const fullUpdateStudentValidator = vine.compile(
  vine.object({
    basicInfo: vine.object({
      name: vine.string().trim().minLength(2).maxLength(255),
      email: vine.string().email().trim().optional(),
      phone: vine.string().trim(),
      birthDate: vine.date(),
      documentType: vine.enum(['CPF', 'RG', 'PASSPORT']),
      documentNumber: vine.string().trim(),
      isSelfResponsible: vine.boolean(),
      whatsappContact: vine.boolean(),
    }),
    responsibles: vine.array(
      vine.object({
        id: vine.string().uuid().optional(),
        name: vine.string().trim().minLength(2),
        email: vine.string().email().trim(),
        phone: vine.string().trim(),
        documentType: vine.enum(['CPF', 'RG', 'PASSPORT']),
        documentNumber: vine.string().trim(),
        birthDate: vine.date(),
        isPedagogical: vine.boolean(),
        isFinancial: vine.boolean(),
      })
    ),
    address: vine.object({
      zipCode: vine.string().trim(),
      street: vine.string().trim(),
      number: vine.string().trim(),
      complement: vine.string().trim().optional(),
      neighborhood: vine.string().trim(),
      city: vine.string().trim(),
      state: vine.string().trim(),
    }),
    medicalInfo: vine.object({
      conditions: vine.string().trim().optional(),
      medications: vine
        .array(
          vine.object({
            id: vine.string().uuid().optional(),
            name: vine.string().trim(),
            dosage: vine.string().trim(),
            frequency: vine.string().trim(),
            instructions: vine.string().trim().optional(),
          })
        )
        .optional(),
      emergencyContacts: vine.array(
        vine.object({
          id: vine.string().uuid().optional(),
          name: vine.string().trim(),
          phone: vine.string().trim(),
          relationship: vine.string().trim(),
          order: vine.number(),
        })
      ),
    }),
  })
)

// Validator for full enrollment flow
export const enrollStudentValidator = vine.compile(
  vine.object({
    basicInfo: vine.object({
      name: vine.string().trim().minLength(2).maxLength(255),
      email: vine.string().email().trim().optional(),
      phone: vine.string().trim(),
      birthDate: vine.string(), // ISO string from frontend
      documentType: vine.enum(['CPF', 'RG', 'PASSPORT']),
      documentNumber: vine.string().trim(),
      isSelfResponsible: vine.boolean(),
      whatsappContact: vine.boolean(),
    }),
    responsibles: vine.array(
      vine.object({
        id: vine.string().uuid().optional(),
        name: vine.string().trim().minLength(2),
        email: vine.string().email().trim(),
        phone: vine.string().trim(),
        documentType: vine.enum(['CPF', 'RG', 'PASSPORT']),
        documentNumber: vine.string().trim(),
        birthDate: vine.string(), // ISO string from frontend
        isPedagogical: vine.boolean(),
        isFinancial: vine.boolean(),
      })
    ),
    address: vine.object({
      zipCode: vine.string().trim(),
      street: vine.string().trim(),
      number: vine.string().trim(),
      complement: vine.string().trim().optional(),
      neighborhood: vine.string().trim(),
      city: vine.string().trim(),
      state: vine.string().trim(),
    }),
    medicalInfo: vine.object({
      conditions: vine.string().trim().optional(),
      medications: vine
        .array(
          vine.object({
            name: vine.string().trim(),
            dosage: vine.string().trim(),
            frequency: vine.string().trim(),
            instructions: vine.string().trim().optional(),
          })
        )
        .optional(),
      emergencyContacts: vine.array(
        vine.object({
          name: vine.string().trim(),
          phone: vine.string().trim(),
          relationship: vine.string().trim(),
          order: vine.number(),
        })
      ),
    }),
    billing: vine.object({
      academicPeriodId: vine.string().uuid(),
      courseId: vine.string().uuid().optional(),
      levelId: vine.string().uuid().optional(),
      classId: vine.string().uuid().optional(),
      contractId: vine.string().uuid().optional(),
      monthlyFee: vine.number().min(0).optional(),
      discount: vine.number().min(0).max(100).optional(),
      paymentDate: vine.number().min(1).max(31).optional(),
      paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX']).optional(),
      installments: vine.number().min(1).max(12).optional(),
      scholarshipId: vine.string().uuid().optional().nullable(),
    }),
  })
)
