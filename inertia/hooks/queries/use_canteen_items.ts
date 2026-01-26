import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['canteen-items'].$get

export type CanteenItemsResponse = InferResponseType<typeof $route>

type CanteenItemsQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useCanteenItemsQueryOptions(query: CanteenItemsQuery = {}) {
  const mergedQuery: CanteenItemsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['canteen-items', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<CanteenItemsResponse>
}
