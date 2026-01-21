import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.enrollments.funnel')

export type EnrollmentFunnelStatsResponse = InferResponseType<typeof $route.$get>

type FunnelQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEnrollmentFunnelStatsQueryOptions(query: FunnelQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'funnel', query],
    queryFn: () => {
      return $route.$get({ query }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentFunnelStatsResponse>
}
