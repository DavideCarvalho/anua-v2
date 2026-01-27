import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentBalance')

export type StudentBalanceResponse = InferResponseType<typeof $route.$get>

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
        .$route('api.v1.responsavel.api.studentBalance', { studentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions<StudentBalanceResponse>
}
