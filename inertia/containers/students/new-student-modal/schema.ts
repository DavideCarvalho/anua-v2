import { z } from 'zod'

export const PaymentMethod = ['BOLETO', 'CREDIT_CARD', 'PIX'] as const
export type PaymentMethod = (typeof PaymentMethod)[number]

export const DocumentType = ['CPF', 'RG', 'PASSPORT'] as const
export type DocumentType = (typeof DocumentType)[number]

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

export const newStudentSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().min(1, 'O telefone é obrigatório'),
    birthDate: z.date({ required_error: 'A data de nascimento é obrigatória' }),
    documentType: z.enum(DocumentType),
    documentNumber: z.string().min(1, 'O número do documento é obrigatório'),
    isSelfResponsible: z.boolean(),
    whatsappContact: z.boolean(),
  }),
  responsibles: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'O nome é obrigatório'),
      email: z.string().min(1, 'O email é obrigatório').email('Email inválido'),
      phone: z.string().min(1, 'O telefone é obrigatório'),
      documentType: z.enum(DocumentType),
      documentNumber: z.string().min(1, 'O número do documento é obrigatório'),
      birthDate: z.date({ required_error: 'A data de nascimento é obrigatória' }),
      isPedagogical: z.boolean(),
      isFinancial: z.boolean(),
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
          required_error: 'O parentesco é obrigatório',
        }),
        order: z.number(),
      })
    ),
  }),
  billing: z.object({
    academicPeriodId: z.string().min(1, 'O período letivo é obrigatório'),
    courseId: z.string().min(1, 'O curso é obrigatório'),
    levelId: z.string().min(1, 'O nível é obrigatório'),
    classId: z.string().optional(),
    contractId: z.string().optional(),
    monthlyFee: z.number().min(0, 'O valor deve ser maior ou igual a 0'),
    discount: z
      .number()
      .min(0, 'O desconto deve ser maior ou igual a 0')
      .max(100, 'O desconto deve ser menor ou igual a 100'),
    paymentDate: z
      .number()
      .min(1, 'O dia deve ser maior que 0')
      .max(31, 'O dia deve ser menor ou igual a 31'),
    paymentMethod: z.enum(PaymentMethod),
    installments: z.number().min(1).max(12),
    scholarshipId: z.string().nullable().optional(),
  }),
})

export type NewStudentFormData = z.infer<typeof newStudentSchema>
