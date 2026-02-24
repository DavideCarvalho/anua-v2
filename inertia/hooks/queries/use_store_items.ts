import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.storeItems.index')
export type StoreItemsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type StoreItemsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useStoreItemsQueryOptions(query: StoreItemsQuery = {}) {
  return queryOptions({
    queryKey: ['store-items', query],
    queryFn: () => resolveRoute().$get({ query }).unwrap(),
  })
}
