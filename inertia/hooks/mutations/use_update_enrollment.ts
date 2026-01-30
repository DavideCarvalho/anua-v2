import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface UpdateEnrollmentParams {
  studentId: string
  enrollmentId: string
  data: {
    contractId?: string
    scholarshipId?: string | null
    paymentMethod?: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
    paymentDay?: number
    installments?: number
  }
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      return tuyau
        .$route('api.v1.students.enrollments.update', { id: studentId, enrollmentId } as any)
        .$patch(data as any)
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
