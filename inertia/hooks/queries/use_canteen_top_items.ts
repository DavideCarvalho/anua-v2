import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.canteen.topItems')
export type CanteenTopItemsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type CanteenTopItemsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useCanteenTopItemsQueryOptions(query: CanteenTopItemsQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'canteen', 'top-items', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.canteen.topItems').$get({ query }).unwrap()
    },
  })
}
