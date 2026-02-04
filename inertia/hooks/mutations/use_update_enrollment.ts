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

  const mutation = useMutation({
    mutationFn: ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      return tuyau
        .$route('api.v1.students.enrollments.update', { id: studentId, enrollmentId })
        .$patch(data)
        .unwrap()
    },
  })

  async function updateEnrollment(params: UpdateEnrollmentParams) {
    const result = await mutation.mutateAsync(params)
    queryClient.invalidateQueries({ queryKey: ['student-enrollments', params.studentId] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    queryClient.invalidateQueries({ queryKey: ['student-pending-payments', params.studentId] })
    return result
  }

  return { ...mutation, updateEnrollment }
}
