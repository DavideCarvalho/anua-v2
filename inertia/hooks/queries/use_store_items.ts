import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.storeItems.index')
export type StoreItemsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type StoreItemsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useStoreItemsQueryOptions(query: StoreItemsQuery = {}) {
  return {
    queryKey: ['store-items', query],
    queryFn: () => resolveRoute().$get({ query }).unwrap(),
  } satisfies QueryOptions
}
