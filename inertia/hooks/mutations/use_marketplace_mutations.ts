import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $checkoutRoute = tuyau.$route('api.v1.marketplace.checkout')

type CheckoutPayload = InferRequestType<typeof $checkoutRoute.$post>

export function useMarketplaceCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CheckoutPayload) => $checkoutRoute.$post(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace', 'orders'] })
    },
  })
}
