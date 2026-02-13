import { useMutation } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface UpdateEnrollmentParams {
  studentId: string
  enrollmentId: string
  data: {
    contractId?: string
    scholarshipId?: string | null
    paymentMethod?: 'BOLETO' | 'PIX'
    paymentDay?: number
    installments?: number
  }
}

export function useUpdateEnrollment() {
  return useMutation({
    mutationFn: ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      return tuyau
        .$route('api.v1.students.enrollments.update', { id: studentId, enrollmentId })
        .$patch(data)
        .unwrap()
    },
  })
}
