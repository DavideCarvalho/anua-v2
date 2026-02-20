import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentBalance')
export type StudentBalanceResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseStudentBalanceOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useStudentBalanceQueryOptions({
  studentId,
  page = 1,
  limit = 20,
}: UseStudentBalanceOptions) {
  return {
    queryKey: ['responsavel', 'student-balance', studentId, { page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.responsavel.api.studentBalance', { studentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
