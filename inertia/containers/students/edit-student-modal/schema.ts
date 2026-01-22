import { z } from 'zod'
import {
  DocumentType,
  PaymentMethod,
  EmergencyContactRelationship,
} from '../new-student-modal/schema'

// Schema for edit is similar to new student but with optional fields and IDs
export const editStudentSchema = z.object({
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
          id: z.string().optional(),
          name: z.string().min(1, 'O nome do medicamento é obrigatório'),
          dosage: z.string().min(1, 'A dosagem é obrigatória'),
          frequency: z.string().min(1, 'A frequência é obrigatória'),
          instructions: z.string().optional(),
        })
      )
      .optional(),
    emergencyContacts: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'O nome é obrigatório'),
        phone: z.string().min(1, 'O telefone é obrigatório'),
        relationship: z.enum(EmergencyContactRelationship, {
          required_error: 'O parentesco é obrigatório',
        }),
        order: z.number(),
      })
    ),
  }),
})

export type EditStudentFormData = z.infer<typeof editStudentSchema>
