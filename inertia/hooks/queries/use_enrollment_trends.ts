import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.enrollments.trends')

export type EnrollmentTrendsResponse = InferResponseType<typeof $route.$get>

type TrendsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEnrollmentTrendsQueryOptions(query: TrendsQuery = {}) {
  const mergedQuery: TrendsQuery = {
    days: 30,
    ...query,
  }

  return {
    queryKey: ['analytics', 'enrollments', 'trends', mergedQuery],
    queryFn: () => {
      return $route.$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentTrendsResponse>
}
