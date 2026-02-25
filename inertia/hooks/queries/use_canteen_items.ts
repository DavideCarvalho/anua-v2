import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['canteen-items'].$get

export type CanteenItemsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type CanteenItemsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useCanteenItemsQueryOptions(query: CanteenItemsQuery = {}) {
  const mergedQuery: CanteenItemsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return queryOptions({
    queryKey: ['canteen-items', mergedQuery],
    enabled: !!mergedQuery.canteenId,
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  })
}
