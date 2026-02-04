import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CheckoutPayload {
  studentId?: string
  storeId: string
  items: Array<{ storeItemId: string; quantity: number }>
  paymentMode?: 'IMMEDIATE' | 'DEFERRED'
  paymentMethod?: 'BALANCE' | 'PIX' | 'CASH' | 'CARD'
  installments?: number
  notes?: string
}

export function useMarketplaceCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CheckoutPayload) =>
      tuyau.$route('api.v1.marketplace.checkout').$post(data as any).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace', 'orders'] })
    },
  })
}
