import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.incidents.overview')

export type IncidentsOverviewResponse = InferResponseType<typeof $route.$get>

type IncidentsOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useIncidentsOverviewQueryOptions(query: IncidentsOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'incidents', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.incidents.overview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<IncidentsOverviewResponse>
}
