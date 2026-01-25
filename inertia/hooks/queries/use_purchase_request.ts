import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.purchaseRequests.show')

export type PurchaseRequestResponse = InferResponseType<typeof $route.$get>

type PurchaseRequestParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']

export function usePurchaseRequestQueryOptions(params: PurchaseRequestParams) {
  return {
    queryKey: ['purchase-request', params.id],
    queryFn: () => {
      return tuyau.$route('api.v1.purchaseRequests.show').$get({ params }).unwrap()
    },
    enabled: !!params.id,
  } satisfies QueryOptions<PurchaseRequestResponse>
}
