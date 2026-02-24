import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.incidents.overview')
export type IncidentsOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type IncidentsOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useIncidentsOverviewQueryOptions(query: IncidentsOverviewQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'incidents', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.incidents.overview').$get({ query }).unwrap()
    },
  })
}
