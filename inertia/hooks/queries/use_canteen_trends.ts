import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.canteen.trends')

export type CanteenTrendsResponse = InferResponseType<typeof $route.$get>

type CanteenTrendsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useCanteenTrendsQueryOptions(query: CanteenTrendsQuery = {}) {
  return {
    queryKey: ['analytics', 'canteen', 'trends', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.canteen.trends').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<CanteenTrendsResponse>
}
