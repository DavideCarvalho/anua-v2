import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.enrollments.overview')

export type EnrollmentsOverviewResponse = InferResponseType<typeof $route.$get>

type EnrollmentsOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useEnrollmentsOverviewQueryOptions(query: EnrollmentsOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'enrollments', 'overview', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.analytics.enrollments.overview')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<EnrollmentsOverviewResponse>
}
