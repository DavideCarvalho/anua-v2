import { z } from 'zod'

export const PaymentMethod = ['BOLETO', 'CREDIT_CARD', 'PIX'] as const
export type PaymentMethod = (typeof PaymentMethod)[number]

export const DocumentType = ['CPF', 'RG', 'PASSPORT'] as const
export type DocumentType = (typeof DocumentType)[number]

export const DocumentTypeLabels: Record<DocumentType, string> = {
  CPF: 'CPF',
  RG: 'RG',
  PASSPORT: 'Passaporte',
}

export const EmergencyContactRelationship = [
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
] as const
export type EmergencyContactRelationship = (typeof EmergencyContactRelationship)[number]

export const EmergencyContactRelationshipLabels: Record<EmergencyContactRelationship, string> = {
  MOTHER: 'Mãe',
  FATHER: 'Pai',
  GRANDMOTHER: 'Avó',
  GRANDFATHER: 'Avô',
  AUNT: 'Tia',
  UNCLE: 'Tio',
  COUSIN: 'Primo(a)',
  NEPHEW: 'Sobrinho',
  NIECE: 'Sobrinha',
  GUARDIAN: 'Responsável Legal',
  OTHER: 'Outro',
}

export const enrollmentSchema = z.object({
  basicInfo: z
    .object({
      name: z.string().min(1, 'O nome é obrigatório'),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      birthDate: z.date({ error: 'A data de nascimento é obrigatória' }),
      documentType: z.enum(DocumentType),
      documentNumber: z.string().optional().or(z.literal('')),
      isSelfResponsible: z.boolean(),
      whatsappContact: z.boolean(),
    })
    .refine(
      (data) => {
        // Phone is required only for adults (18+)
        const today = new Date()
        const birthDate = data.birthDate
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const isAdult =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1 >= 18
            : age >= 18

        if (isAdult && (!data.phone || data.phone.length === 0)) {
          return false
        }
        return true
      },
      {
        message: 'O telefone é obrigatório para maiores de 18 anos',
        path: ['phone'],
      }
    )
    .refine(
      (data) => {
        // Document is required only for adults (18+)
        const today = new Date()
        const birthDate = data.birthDate
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const isAdult =
          monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1 >= 18
            : age >= 18

        if (isAdult && (!data.documentNumber || data.documentNumber.length === 0)) {
          return false
        }
        return true
      },
      {
        message: 'O número do documento é obrigatório para maiores de 18 anos',
        path: ['documentNumber'],
      }
    ),
  responsibles: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'O nome é obrigatório'),
      email: z.string().min(1, 'O email é obrigatório').email('Email inválido'),
      phone: z.string().min(1, 'O telefone é obrigatório'),
      documentType: z.enum(DocumentType),
      documentNumber: z.string().min(1, 'O número do documento é obrigatório'),
      birthDate: z.date({ error: 'A data de nascimento é obrigatória' }),
      isPedagogical: z.boolean(),
      isFinancial: z.boolean(),
      isEmergencyContact: z.boolean(),
      isExisting: z.boolean().optional(),
    })
  ),
  address: z.object({
    zipCode: z.string().min(1, 'O CEP é obrigatório'),
    street: z.string().min(1, 'A rua é obrigatória'),
    number: z.string().min(1, 'O número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'O bairro é obrigatório'),
    city: z.string().min(1, 'A cidade é obrigatória'),
    state: z.string().min(1, 'O estado é obrigatório'),
  }),
  medicalInfo: z.object({
    conditions: z.string().optional(),
    medications: z
      .array(
        z.object({
          name: z.string().min(1, 'O nome do medicamento é obrigatório'),
          dosage: z.string().min(1, 'A dosagem é obrigatória'),
          frequency: z.string().min(1, 'A frequência é obrigatória'),
          instructions: z.string().optional(),
        })
      )
      .optional(),
    emergencyContacts: z.array(
      z.object({
        name: z.string().min(1, 'O nome é obrigatório'),
        phone: z.string().min(1, 'O telefone é obrigatório'),
        relationship: z.enum(EmergencyContactRelationship, {
          error: 'O parentesco é obrigatório',
        }),
        order: z.number(),
        responsibleIndex: z.number().optional(),
      })
    ),
  }),
  billing: z.object({
    academicPeriodId: z.string().min(1, 'O período letivo é obrigatório'),
    courseId: z.string().min(1, 'O curso é obrigatório'),
    levelId: z.string().min(1, 'O nível é obrigatório'),
    classId: z.string().optional(),
    contractId: z.string().nullable().optional(),

    // Contract values
    monthlyFee: z.number().min(0, 'O valor deve ser maior ou igual a 0'),
    enrollmentFee: z.number().min(0).optional().default(0),
    installments: z.number().min(1).max(12),
    enrollmentInstallments: z.number().min(1).max(12).optional().default(1),
    flexibleInstallments: z.boolean().optional().default(true),

    // Payment
    paymentDate: z
      .number()
      .min(1, 'O dia deve ser maior que 0')
      .max(31, 'O dia deve ser menor ou igual a 31'),
    paymentMethod: z.enum(PaymentMethod),

    // Scholarship
    scholarshipId: z.string().nullable().optional(),
    discountPercentage: z.number().min(0).max(100).optional().default(0),
    enrollmentDiscountPercentage: z.number().min(0).max(100).optional().default(0),

    // Individual Discounts
    individualDiscounts: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1, 'Nome do desconto é obrigatório'),
          description: z.string().optional(),
          discountType: z.enum(['PERCENTAGE', 'FLAT']),
          discountPercentage: z.number().min(0).max(100).optional(),
          enrollmentDiscountPercentage: z.number().min(0).max(100).optional(),
          discountValue: z.number().min(0).optional(),
          enrollmentDiscountValue: z.number().min(0).optional(),
        })
      )
      .optional()
      .default([]),
  }),
})

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>
