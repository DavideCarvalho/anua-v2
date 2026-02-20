import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['student-payments'].$get

export type StudentPaymentsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type StudentPaymentsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useStudentPaymentsQueryOptions(query: StudentPaymentsQuery = {}) {
  const mergedQuery: StudentPaymentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['student-payments', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
