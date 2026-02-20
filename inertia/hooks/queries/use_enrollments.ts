import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.enrollments.index')
export type EnrollmentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type EnrollmentsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEnrollmentsQueryOptions(query: EnrollmentsQuery) {
  const mergedQuery: EnrollmentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['enrollments', mergedQuery],
    queryFn: () => {
      return resolveRoute().$get({ query: mergedQuery }).unwrap()
    },
    enabled: !!query.schoolId,
  }
}
