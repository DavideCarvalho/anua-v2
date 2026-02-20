import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.purchaseRequests.update')
type UpdateBody = InferRequestType<ReturnType<typeof resolveRoute>['$put']>

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
