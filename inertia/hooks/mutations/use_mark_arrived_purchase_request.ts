import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMarkArrivedPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; arrivalDate: string }) => {
      const { id, ...body } = data
      return tuyau.$route('api.v1.purchaseRequests.markArrived', { id }).$post(body as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
