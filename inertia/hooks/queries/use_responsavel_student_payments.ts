import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentPayments')
export type ResponsavelStudentPaymentsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

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
        .resolveRoute()('api.v1.responsavel.api.studentPayments', { studentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
