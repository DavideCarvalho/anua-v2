import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeOrders.index')

export type StoreOrdersResponse = InferResponseType<typeof $route.$get>

type StoreOrdersQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useStoreOrdersQueryOptions(query: StoreOrdersQuery = {}) {
  return {
    queryKey: ['store-orders', query],
    queryFn: () => $route.$get({ query }).unwrap(),
  } satisfies QueryOptions
}
