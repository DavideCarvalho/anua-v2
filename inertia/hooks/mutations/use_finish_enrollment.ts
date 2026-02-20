import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.enrollment.finish')
type StudentInfo = {
  name: string
  email: string
  phone?: string
  birthDate: string
  documentType: 'CPF' | 'RG' | 'PASSPORT' | 'OTHER'
  document: string
  isSelfResponsible: boolean
}

type ResponsibleInfo = {
  name: string
  email: string
  phone: string
  birthDate?: string
  documentType: 'CPF' | 'RG' | 'PASSPORT' | 'OTHER'
  document: string
  isPedagogical: boolean
  isFinancial: boolean
}

type AddressInfo = {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

type MedicalInfo = {
  conditions?: string
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
    instructions?: string
  }>
}

type EmergencyContact = {
  name: string
  phone: string
  relationship:
    | 'MOTHER'
    | 'FATHER'
    | 'GRANDMOTHER'
    | 'GRANDFATHER'
    | 'AUNT'
    | 'UNCLE'
    | 'COUSIN'
    | 'NEPHEW'
    | 'NIECE'
    | 'GUARDIAN'
    | 'OTHER'
}

type BillingInfo = {
  paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  paymentDay?: number
  enrollmentInstallments?: number
  installments?: number
  scholarshipCode?: string
}

type FinishEnrollmentData = {
  student: StudentInfo
  responsibles: ResponsibleInfo[]
  address: AddressInfo
  medicalInfo?: MedicalInfo
  emergencyContacts: EmergencyContact[]
  billing: BillingInfo
  schoolId: string
  academicPeriodId: string
  courseId: string
  levelId: string
  contractId?: string
}

export function useFinishEnrollmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FinishEnrollmentData) => {
      return resolveRoute()
        .$post(data as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
