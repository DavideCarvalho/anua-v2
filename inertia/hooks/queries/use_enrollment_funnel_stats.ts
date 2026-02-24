import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.enrollments.funnel')
export type EnrollmentFunnelStatsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

type FunnelQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useEnrollmentFunnelStatsQueryOptions(query: FunnelQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'enrollments', 'funnel', query],
    queryFn: () => {
      return resolveRoute().$get({ query }).unwrap()
    },
  })
}
