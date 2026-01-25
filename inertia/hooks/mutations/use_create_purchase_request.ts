import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.purchaseRequests.store')

type CreateBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useCreatePurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBody) => {
      return $route.$post(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
