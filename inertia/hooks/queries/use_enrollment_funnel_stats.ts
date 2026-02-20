import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.analytics.enrollments.funnel')
export type EnrollmentFunnelStatsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

type FunnelQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEnrollmentFunnelStatsQueryOptions(query: FunnelQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'funnel', query],
    queryFn: () => {
      return resolveRoute().$get({ query }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentFunnelStatsResponse>
}
