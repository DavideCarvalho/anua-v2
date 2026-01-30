import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.purchaseRequests.update')

type UpdateBody = InferRequestType<typeof $route.$put>

export function useUpdatePurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateBody & { id: string }) => {
      return tuyau.$route('api.v1.purchaseRequests.update', { id }).$put(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
