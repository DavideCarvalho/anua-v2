import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['student-payments'].$get

export type StudentPaymentsResponse = InferResponseType<typeof $route>

type StudentPaymentsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useStudentPaymentsQueryOptions(query: StudentPaymentsQuery = {}) {
  const mergedQuery: StudentPaymentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['student-payments', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
