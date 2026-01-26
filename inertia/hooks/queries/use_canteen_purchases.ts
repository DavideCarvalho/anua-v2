import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['canteen-purchases'].$get

export type CanteenPurchasesResponse = InferResponseType<typeof $route>

type CanteenPurchasesQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useCanteenPurchasesQueryOptions(query: CanteenPurchasesQuery = {}) {
  const mergedQuery: CanteenPurchasesQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['canteen-purchases', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<CanteenPurchasesResponse>
}
