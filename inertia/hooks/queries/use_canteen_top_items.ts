import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.canteen.topItems')

export type CanteenTopItemsResponse = InferResponseType<typeof $route.$get>

type CanteenTopItemsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useCanteenTopItemsQueryOptions(query: CanteenTopItemsQuery = {}) {
  return {
    queryKey: ['analytics', 'canteen', 'top-items', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.canteen.topItems').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<CanteenTopItemsResponse>
}
