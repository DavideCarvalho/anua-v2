import { z } from 'zod'

export const schoolEditSchema = z.object({
  // Dados Básicos
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  logoUrl: z.string().url('URL inválida').optional().nullable(),

  // Endereço
  zipCode: z.string().max(10).optional().nullable(),
  street: z.string().max(255).optional().nullable(),
  number: z.string().max(20).optional().nullable(),
  complement: z.string().max(100).optional().nullable(),
  neighborhood: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Acadêmico
  minimumGrade: z.number().min(0).max(10).default(7),
  minimumAttendancePercentage: z.number().min(0).max(100).default(75),
  calculationAlgorithm: z.enum(['AVERAGE', 'SUM']).default('AVERAGE'),

  // Seguro
  hasInsurance: z.boolean().optional().nullable(),
  insurancePercentage: z.number().min(3).max(100).optional().nullable(),
  insuranceCoveragePercentage: z.number().min(0).max(100).optional().nullable(),
  insuranceClaimWaitingDays: z.number().min(1).optional().nullable(),
})

export type SchoolEditFormData = z.infer<typeof schoolEditSchema>
