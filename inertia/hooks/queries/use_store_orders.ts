import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.storeOrders.index')
export type StoreOrdersResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type StoreOrdersQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useStoreOrdersQueryOptions(query: StoreOrdersQuery = {}) {
  return {
    queryKey: ['store-orders', query],
    queryFn: () => resolveRoute().$get({ query }).unwrap(),
  } satisfies QueryOptions
}
