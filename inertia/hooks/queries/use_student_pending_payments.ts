import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'

const $route = tuyau.api.v1['student-payments'].$get

export function useStudentPendingPaymentsQueryOptions(studentId: string | undefined) {
  return {
    queryKey: ['student-pending-payments', studentId],
    queryFn: () => {
      return $route({
        query: {
          studentId,
          limit: 100,
        },
      }).unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions
}
