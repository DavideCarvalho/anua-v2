import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.hr.overview')

export type HrOverviewResponse = InferResponseType<typeof $route.$get>

type HrOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useHrOverviewQueryOptions(query: HrOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'hr', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.hr.overview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<HrOverviewResponse>
}
