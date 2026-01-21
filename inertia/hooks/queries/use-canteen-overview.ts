import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.canteen.overview')

export type CanteenOverviewResponse = InferResponseType<typeof $route.$get>

type CanteenOverviewQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useCanteenOverviewQueryOptions(query: CanteenOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'canteen', 'overview', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.analytics.canteen.overview')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<CanteenOverviewResponse>
}
