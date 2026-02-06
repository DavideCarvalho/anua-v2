import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeItems.index')

export type StoreItemsResponse = InferResponseType<typeof $route.$get>

type StoreItemsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useStoreItemsQueryOptions(query: StoreItemsQuery = {}) {
  return {
    queryKey: ['store-items', query],
    queryFn: () => $route.$get({ query }).unwrap(),
  } satisfies QueryOptions
}
