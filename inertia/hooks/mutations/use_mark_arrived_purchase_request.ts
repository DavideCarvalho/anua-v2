import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.purchaseRequests.markArrived')

type MarkArrivedParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type MarkArrivedBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useMarkArrivedPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: MarkArrivedBody & { params: MarkArrivedParams }) => {
      return $route.$post({ params, ...body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
