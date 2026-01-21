import { z } from 'zod'

export const schoolOnboardingSchema = z.object({
  // School data
  schoolName: z.string().min(1, 'Nome da escola é obrigatório'),
  isNetwork: z.boolean(),
  schoolChainId: z.string().optional(),

  // Address data
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Director data
  directorName: z.string().min(1, 'Nome do diretor é obrigatório'),
  directorEmail: z.string().email('Email inválido'),
  directorPhone: z.string().optional(),

  // Subscription data
  trialDays: z.number().int().min(0, 'Dias de trial devem ser positivos'),
  pricePerStudent: z.number().int().min(0, 'Preço por aluno deve ser positivo'),
  platformFeePercentage: z
    .number()
    .min(0, 'Taxa da plataforma deve ser positiva')
    .max(100, 'Taxa da plataforma não pode exceder 100%'),

  // Insurance data
  hasInsurance: z.boolean().default(false),
  insurancePercentage: z.number().min(3, 'Porcentagem mínima de seguro é 3%').optional(),
  insuranceCoveragePercentage: z
    .number()
    .min(0, 'Cobertura deve ser positiva')
    .max(100, 'Cobertura não pode exceder 100%')
    .optional(),
  insuranceClaimWaitingDays: z
    .number()
    .int()
    .min(1, 'Dias de espera devem ser positivos')
    .optional(),
})

export type SchoolOnboardingFormData = z.infer<typeof schoolOnboardingSchema>

export const createSchoolChainSchema = z.object({
  name: z.string().min(1, 'Nome da rede é obrigatório'),
  subscriptionLevel: z.enum(['NETWORK', 'INDIVIDUAL']),
  trialDays: z.number().int().min(0).optional(),
  pricePerStudent: z.number().int().min(0).optional(),
})

export type CreateSchoolChainFormData = z.infer<typeof createSchoolChainSchema>
