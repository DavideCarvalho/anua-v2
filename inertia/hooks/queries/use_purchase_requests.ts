import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.purchaseRequests.index')

export type PurchaseRequestsResponse = InferResponseType<typeof $route.$get>

type PurchaseRequestsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function usePurchaseRequestsQueryOptions(query: PurchaseRequestsQuery = {}) {
  const mergedQuery: PurchaseRequestsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['purchase-requests', mergedQuery],
    queryFn: () => {
      return tuyau.$route('api.v1.purchaseRequests.index').$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<PurchaseRequestsResponse>
}
