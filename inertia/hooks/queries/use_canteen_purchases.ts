import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['canteen-purchases'].$get

export type CanteenPurchasesResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type CanteenPurchasesQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useCanteenPurchasesQueryOptions(query: CanteenPurchasesQuery = {}) {
  const mergedQuery: CanteenPurchasesQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['canteen-purchases', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<CanteenPurchasesResponse>
}
