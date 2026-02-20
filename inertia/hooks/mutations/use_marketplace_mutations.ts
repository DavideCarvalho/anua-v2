import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCheckoutRoute = () => tuyau.$route('api.v1.marketplace.checkout')
type CheckoutPayload = InferRequestType<ReturnType<typeof resolveCheckoutRoute>['$post']>

export function useMarketplaceCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CheckoutPayload) => resolveCheckoutRoute().$post(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace', 'orders'] })
    },
  })
}
