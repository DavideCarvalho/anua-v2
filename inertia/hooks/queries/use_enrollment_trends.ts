import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.enrollments.trends')
export type EnrollmentTrendsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type TrendsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEnrollmentTrendsQueryOptions(query: TrendsQuery = {}) {
  const mergedQuery: TrendsQuery = {
    days: 30,
    ...query,
  }

  return {
    queryKey: ['analytics', 'enrollments', 'trends', mergedQuery],
    queryFn: () => {
      return resolveRoute().$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentTrendsResponse>
}
