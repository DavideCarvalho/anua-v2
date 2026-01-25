import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentPayments')

export type ResponsavelStudentPaymentsResponse = InferResponseType<typeof $route.$get>

interface UseResponsavelStudentPaymentsOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useResponsavelStudentPaymentsQueryOptions({
  studentId,
  page = 1,
  limit = 20,
}: UseResponsavelStudentPaymentsOptions) {
  return {
    queryKey: ['responsavel', 'student-payments', studentId, { page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.responsavel.api.studentPayments')
        .$get({ params: { studentId }, query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions<ResponsavelStudentPaymentsResponse>
}
