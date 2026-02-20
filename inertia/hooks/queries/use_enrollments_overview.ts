import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.enrollments.overview')
export type EnrollmentsOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type EnrollmentsOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useEnrollmentsOverviewQueryOptions(query: EnrollmentsOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.enrollments.overview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<EnrollmentsOverviewResponse>
}
