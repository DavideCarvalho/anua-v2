import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMarkBoughtPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      id: string
      finalQuantity: number
      finalUnitValue: number
      finalValue: number
      estimatedArrivalDate: string
      receiptPath?: string
    }) => {
      const { id, ...body } = data
      return tuyau
        .$route('api.v1.purchaseRequests.markBought', { id })
        .$post(body as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
