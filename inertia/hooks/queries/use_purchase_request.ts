import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.purchaseRequests.show')
export type PurchaseRequestResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePurchaseRequestQueryOptions(params: { id: string }) {
  return {
    queryKey: ['purchase-request', params.id],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.purchaseRequests.show', { id: params.id }).$get().unwrap()
    },
    enabled: !!params.id,
  }
}
