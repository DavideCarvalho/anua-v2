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
      const response = await tuyau.api.v1
        .students({ id: studentId })
        .enrollments({ enrollmentId })
        .$patch(data)

      if (response.error) {
        throw new Error('Erro ao atualizar informações de pagamento')
      }

      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
