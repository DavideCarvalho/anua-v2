import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.analytics.canteen.trends')
export type CanteenTrendsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type CanteenTrendsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useCanteenTrendsQueryOptions(query: CanteenTrendsQuery = {}) {
  return {
    queryKey: ['analytics', 'canteen', 'trends', query],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.analytics.canteen.trends').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<CanteenTrendsResponse>
}
