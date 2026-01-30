import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRejectPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; reason: string }) => {
      const { id, ...body } = data
      return tuyau
        .$route('api.v1.purchaseRequests.reject', { id })
        .$post(body as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
