import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.purchaseRequests.markBought')

type MarkBoughtParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type MarkBoughtBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useMarkBoughtPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: MarkBoughtBody & { params: MarkBoughtParams }) => {
      return $route.$post({ params, ...body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
